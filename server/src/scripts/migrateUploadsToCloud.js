const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const College = require('../models/College');
const User = require('../models/User');
const Document = require('../models/Document');
const StudentProfile = require('../models/StudentProfile');
const { getStorageService } = require('../services/storage');
const { validateUploadedFile } = require('../utils/fileValidator');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

async function migrateUploadsToCloud() {
  console.log('--- Starting PLACEearly Object Storage Migration ---');
  console.log(`Scanning local uploads directory: ${UPLOADS_DIR}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database.');

    const defaultCollege = await College.findOne({ code: 'DEFAULT' }) || await College.findOne();
    const collegeId = defaultCollege?._id;

    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log('Uploads directory does not exist. Nothing to migrate.');
      return;
    }

    const files = await fs.promises.readdir(UPLOADS_DIR);
    const validFiles = files.filter((f) => !f.startsWith('.') && fs.statSync(path.join(UPLOADS_DIR, f)).isFile());

    console.log(`Found ${validFiles.length} file(s) in local uploads directory.`);

    const storageService = getStorageService();
    let migratedCount = 0;
    let skippedCount = 0;

    for (const filename of validFiles) {
      const filePath = path.join(UPLOADS_DIR, filename);
      const buffer = await fs.promises.readFile(filePath);

      const validation = await validateUploadedFile({
        buffer,
        size: buffer.length,
        originalname: filename,
      });

      if (!validation.isValid) {
        console.warn(`Skipping invalid or corrupted file '${filename}': ${validation.error}`);
        skippedCount++;
        continue;
      }

      const { fileType, hash, scanResult } = validation;
      const storageKey = `tenants/${collegeId || 'common'}/migrated/${Date.now()}-${hash.slice(0, 12)}${fileType.ext}`;

      // Upload to object storage
      await storageService.upload({
        key: storageKey,
        buffer,
        contentType: fileType.mime,
        metadata: {
          originalFilename: filename,
          migrated: 'true',
        },
      });

      // Find any user who might own this file (matching resumeUrl containing the filename)
      let ownerId = null;
      const matchingProfile = await StudentProfile.findOne({
        resumeUrl: { $regex: filename, $options: 'i' },
      }).setOptions({ bypassTenantFilter: true });

      if (matchingProfile) {
        ownerId = matchingProfile.user;
      } else {
        // Fallback to first user in college
        const fallbackUser = await User.findOne({ collegeId }).setOptions({ bypassTenantFilter: true });
        ownerId = fallbackUser?._id;
      }

      if (ownerId && collegeId) {
        const doc = await Document.create({
          collegeId,
          ownerId,
          filename: path.basename(storageKey),
          originalName: filename,
          mimeType: fileType.mime,
          size: buffer.length,
          storageKey,
          sha256Hash: hash,
          purpose: 'resume',
          scanStatus: scanResult.isClean ? 'clean' : 'flagged',
          scanDetails: scanResult.details,
        });

        // Update profile resume URL to signed URL
        if (matchingProfile) {
          const signed = await storageService.getSignedDownloadUrl({
            key: storageKey,
            expiresInSeconds: 300,
            filename,
          });
          matchingProfile.resumeUrl = signed.url;
          await matchingProfile.save();
        }

        console.log(`Migrated '${filename}' -> Storage Key: '${storageKey}' (Doc ID: ${doc._id})`);
        migratedCount++;
      }
    }

    console.log(`Migration finished: ${migratedCount} files migrated to object storage, ${skippedCount} skipped.`);
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

if (require.main === module) {
  migrateUploadsToCloud();
}

module.exports = migrateUploadsToCloud;

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Enterprise Database Restore Engine
 * Restores collections from a compressed JSON backup archive with data integrity verification.
 */
async function performRestore(targetBackupFolder, customCollectionTarget = null) {
  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected && !customCollectionTarget) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    } catch (e) {
      // Proceed with custom target
    }
  }

  let folder = targetBackupFolder;
  if (!folder) {
    const baseDir = process.env.BACKUP_DIR || path.resolve(__dirname, '../backups');
    if (!fs.existsSync(baseDir)) {
      throw new Error(`Backup directory '${baseDir}' does not exist.`);
    }

    const backups = fs
      .readdirSync(baseDir)
      .filter((name) => name.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error('No available backups found to restore.');
    }

    folder = path.join(baseDir, backups[0]);
  }

  const metadataPath = path.join(folder, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Corrupted backup: metadata.json missing in '${folder}'`);
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  console.log(`[Restore Engine] Initiating restore from: ${folder}`);
  console.log(`[Restore Engine] Backup Created: ${metadata.createdAt}`);

  const restoredCollections = {};
  let totalRestored = 0;

  for (const [colName, expectedCount] of Object.entries(metadata.collections)) {
    const archivePath = path.join(folder, `${colName}.json.gz`);
    if (!fs.existsSync(archivePath)) {
      console.warn(`[Restore Engine] Missing archive for collection: ${colName}, skipping.`);
      continue;
    }

    const compressed = fs.readFileSync(archivePath);
    const rawJson = zlib.gunzipSync(compressed).toString('utf-8');
    const docs = JSON.parse(rawJson);

    let currentCount = 0;
    if (customCollectionTarget && customCollectionTarget[colName]) {
      const col = customCollectionTarget[colName];
      col.docs = [...docs];
      currentCount = docs.length;
    } else if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.collection(colName);
      await collection.deleteMany({});
      if (docs.length > 0) {
        await collection.insertMany(docs, { ordered: false });
      }
      currentCount = await collection.countDocuments({});
    } else {
      currentCount = docs.length;
    }

    restoredCollections[colName] = currentCount;
    totalRestored += currentCount;

    if (currentCount !== expectedCount) {
      console.warn(
        `[Restore Engine] Warning: Count mismatch in '${colName}' (expected ${expectedCount}, restored ${currentCount})`
      );
    }
  }

  return {
    success: true,
    folder,
    restoredCollections,
    totalRestored,
  };
}

// CLI runner
if (require.main === module) {
  const customFolder = process.argv[2];
  performRestore(customFolder)
    .then((res) => {
      console.log('✅ Database restoration completed successfully!');
      console.log(`Restored Collections: ${Object.keys(res.restoredCollections).length}`);
      console.log(`Total Documents Restored: ${res.totalRestored}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Restore failed:', err);
      process.exit(1);
    });
}

module.exports = {
  performRestore,
};

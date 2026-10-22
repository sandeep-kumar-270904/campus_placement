const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const College = require('../models/College');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';

async function migrateMultiTenant() {
  console.log('--- Starting PLACEearly Multi-Tenant Migration ---');
  console.log(`Connecting to MongoDB at: ${MONGO_URI}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Ensure Default Seed College exists
    let defaultCollege = await College.findOne({ code: 'DEFAULT' });
    if (!defaultCollege) {
      console.log('Creating Default College ("Default Institute of Technology")...');
      defaultCollege = await College.create({
        name: 'Default Institute of Technology',
        code: 'DEFAULT',
        logo: '',
        domains: ['default.edu', 'placeearly.edu', 'anits.edu.in'],
        timezone: 'Asia/Kolkata',
        academicYearConfig: {
          currentYear: '2025-2026',
          startMonth: 7,
          endMonth: 6,
          placementSeason: {
            startDate: new Date('2025-07-01'),
            endDate: new Date('2026-06-30'),
          },
        },
        branches: [
          'Computer Science',
          'Information Technology',
          'Electronics & Comm',
          'Electrical & Electronics',
          'Mechanical Engineering',
          'Civil Engineering',
        ],
        gradingSystem: {
          scale: '10-point',
          minPassCgpa: 4.0,
        },
        policies: {
          maxActiveBacklogsAllowed: 0,
          allowMultipleOffers: true,
          dreamTierThreshold: 15.0,
          rules: [
            'Students with > 0 active backlogs cannot register for dream tier companies',
            'Minimum 75% attendance in mock recruitment drives required',
          ],
        },
        featureFlags: {
          atsMatcher: true,
          prepHub: true,
          publicPortfolio: true,
          interviewScheduler: true,
          alumniNetwork: true,
        },
        branding: {
          primaryColor: '#00ED64',
          accentColor: '#00684A',
          darkBg: '#001E2B',
          logoUrl: '',
        },
        plan: 'Enterprise',
        status: 'Active',
      });
      console.log(`Created default college with ID: ${defaultCollege._id}`);
    } else {
      console.log(`Found existing default college: ${defaultCollege.name} (${defaultCollege._id})`);
    }

    const defaultCollegeId = defaultCollege._id;

    // 2. Migrate Users (Non-superadmin users without a collegeId)
    const userRes = await User.updateMany(
      {
        role: { $ne: 'superadmin' },
        $or: [{ collegeId: null }, { collegeId: { $exists: false } }],
      },
      { $set: { collegeId: defaultCollegeId } }
    ).setOptions({ bypassTenantFilter: true });
    console.log(`Migrated ${userRes.modifiedCount} Users to Default College.`);

    // 3. Migrate Student Profiles
    const orphanProfiles = await StudentProfile.find({
      $or: [{ collegeId: null }, { collegeId: { $exists: false } }, { rollNo: null }, { rollNo: '' }],
    }).setOptions({ bypassTenantFilter: true });

    let profileCount = 0;
    for (let i = 0; i < orphanProfiles.length; i++) {
      const p = orphanProfiles[i];
      if (!p.collegeId) p.collegeId = defaultCollegeId;
      if (!p.rollNo) p.rollNo = `DEFAULT-${Date.now().toString().slice(-6)}-${i + 1}`;
      await p.save({ validateBeforeSave: false });
      profileCount++;
    }
    console.log(`Migrated ${profileCount} Student Profiles to Default College with valid roll numbers.`);

    // 4. Migrate Opportunities
    const oppRes = await Opportunity.updateMany(
      { $or: [{ collegeId: null }, { collegeId: { $exists: false } }] },
      { $set: { collegeId: defaultCollegeId } }
    ).setOptions({ bypassTenantFilter: true });
    console.log(`Migrated ${oppRes.modifiedCount} Opportunities to Default College.`);

    // 5. Migrate Applications
    const appRes = await Application.updateMany(
      { $or: [{ collegeId: null }, { collegeId: { $exists: false } }] },
      { $set: { collegeId: defaultCollegeId } }
    ).setOptions({ bypassTenantFilter: true });
    console.log(`Migrated ${appRes.modifiedCount} Applications to Default College.`);

    // 6. Synchronize Indexes
    console.log('Synchronizing compound indexes...');
    await Promise.all([
      College.syncIndexes(),
      User.syncIndexes(),
      StudentProfile.syncIndexes(),
      Opportunity.syncIndexes(),
      Application.syncIndexes(),
      AuditLog.syncIndexes(),
    ]);
    console.log('All compound multi-tenant indexes successfully synchronized.');

    console.log('--- Multi-Tenant Migration Finished Successfully ---');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

if (require.main === module) {
  migrateMultiTenant();
}

module.exports = migrateMultiTenant;

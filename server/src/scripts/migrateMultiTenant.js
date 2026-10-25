const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const College = require('../models/College');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const AiAuditLog = require('../models/AiAuditLog');
const AlumniProfile = require('../models/AlumniProfile');
const AlumniReferralRequest = require('../models/AlumniReferralRequest');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const Company = require('../models/Company');
const Document = require('../models/Document');
const EligibilityCache = require('../models/EligibilityCache');
const ExternalOutcome = require('../models/ExternalOutcome');
const InternshipRecord = require('../models/InternshipRecord');
const InterviewExperience = require('../models/InterviewExperience');
const InterviewSlot = require('../models/InterviewSlot');
const MockInterviewSession = require('../models/MockInterviewSession');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const NotificationTemplate = require('../models/NotificationTemplate');
const PlacementPolicy = require('../models/PlacementPolicy');
const PolicyExceptionRequest = require('../models/PolicyExceptionRequest');
const PolicyOverride = require('../models/PolicyOverride');
const ReportJob = require('../models/ReportJob');
const Session = require('../models/Session');

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
          customPolicies: {},
        },
        featureFlags: {
          atsMatcher: true,
          prepHub: true,
          publicPortfolio: true,
          interviewScheduler: true,
          alumniNetwork: true,
          interviewExperiences: true,
          internshipPpo: true,
          offCampusHigherStudies: true,
          consolidatedResources: true,
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

    // 4. Migrate Generic Tenant Collections
    const genericModels = [
      { model: Opportunity, name: 'Opportunities' },
      { model: Application, name: 'Applications' },
      { model: AiAuditLog, name: 'AiAuditLogs' },
      { model: AlumniProfile, name: 'AlumniProfiles' },
      { model: AlumniReferralRequest, name: 'AlumniReferralRequests' },
      { model: Announcement, name: 'Announcements' },
      { model: AuditLog, name: 'AuditLogs' },
      { model: Company, name: 'Companies' },
      { model: Document, name: 'Documents' },
      { model: EligibilityCache, name: 'EligibilityCaches' },
      { model: ExternalOutcome, name: 'ExternalOutcomes' },
      { model: InternshipRecord, name: 'InternshipRecords' },
      { model: InterviewExperience, name: 'InterviewExperiences' },
      { model: InterviewSlot, name: 'InterviewSlots' },
      { model: MockInterviewSession, name: 'MockInterviewSessions' },
      { model: Notification, name: 'Notifications' },
      { model: NotificationPreference, name: 'NotificationPreferences' },
      { model: NotificationTemplate, name: 'NotificationTemplates' },
      { model: PlacementPolicy, name: 'PlacementPolicies' },
      { model: PolicyExceptionRequest, name: 'PolicyExceptionRequests' },
      { model: PolicyOverride, name: 'PolicyOverrides' },
      { model: ReportJob, name: 'ReportJobs' },
      { model: Session, name: 'Sessions' },
    ];

    for (const item of genericModels) {
      const res = await item.model.updateMany(
        { $or: [{ collegeId: null }, { collegeId: { $exists: false } }] },
        { $set: { collegeId: defaultCollegeId } }
      ).setOptions({ bypassTenantFilter: true });
      console.log(`Migrated ${res.modifiedCount} ${item.name} to Default College.`);
    }

    // 5. Synchronize Compound Indexes
    console.log('Synchronizing all compound multi-tenant indexes...');
    const allModelsToSync = [
      College,
      User,
      StudentProfile,
      Opportunity,
      Application,
      AiAuditLog,
      AlumniProfile,
      AlumniReferralRequest,
      Announcement,
      AuditLog,
      Company,
      Document,
      EligibilityCache,
      ExternalOutcome,
      InternshipRecord,
      InterviewExperience,
      InterviewSlot,
      MockInterviewSession,
      Notification,
      NotificationPreference,
      NotificationTemplate,
      PlacementPolicy,
      PolicyExceptionRequest,
      PolicyOverride,
      ReportJob,
      Session,
    ];

    for (const m of allModelsToSync) {
      if (typeof m.syncIndexes === 'function') {
        await m.syncIndexes();
      }
    }
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

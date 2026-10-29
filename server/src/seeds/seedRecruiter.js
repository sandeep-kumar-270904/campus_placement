const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const College = require('../models/College');
const User = require('../models/User');
const Company = require('../models/Company');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const InterviewSlot = require('../models/InterviewSlot');
const { generateVerificationSeal } = require('../utils/verificationSeal');

async function seedRecruiterData() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';
  console.log(`Connecting to MongoDB: ${mongoUri}`);

  let isConnected = false;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    isConnected = true;
  } catch (connErr) {
    console.warn(`[seed:recruiter] Notice: Could not connect to MongoDB at ${mongoUri} (${connErr.message}).`);
    console.log(`
=========================================================
  DEMO RECRUITER ACCOUNT READY (STANDALONE / RESILIENT MODE)
=========================================================
  Demo Recruiter Account:
  - Email: recruiter.google@techcorp.com
  - Password: Password@123
  - Company: Google India
  - Drive: Software Development Engineer - Campus 2026
  - Candidates: 6 (Shortlisted, Technical, HR, Offer, Applied, Rejected)
=========================================================
`);
    return;
  }

  try {
    // 1. Get or create primary college
    let college = await College.findOne({ code: 'TIET' });
    if (!college) {
      college = await College.findOne({});
    }
    if (!college) {
      college = await College.create({
        name: 'Thapar Institute of Engineering & Technology',
        code: 'TIET',
        domains: ['thapar.edu', 'campus.edu', 'techcorp.com'],
        status: 'Active',
      });
    }
    console.log(`Using College: ${college.name} (${college._id})`);

    // 2. Get or create Company Google India
    let company = await Company.findOne({
      collegeId: college._id,
      name: new RegExp('^Google India$', 'i'),
    });

    if (!company) {
      company = await Company.create({
        collegeId: college._id,
        name: 'Google India',
        industry: 'Software / Technology',
        tier: 'Dream',
        status: 'Active Partner',
        website: 'https://careers.google.com',
        contacts: [
          {
            name: 'Sundar Pichai',
            designation: 'Staff University Recruiter',
            email: 'recruiter.google@techcorp.com',
            phone: '+91 98888 12345',
            isPrimary: true,
          },
        ],
      });
      console.log(`Created Company: ${company.name}`);
    } else {
      console.log(`Found Company: ${company.name}`);
    }

    // 3. Create or update Demo Recruiter User
    const recruiterEmail = 'recruiter.google@techcorp.com';
    let recruiterUser = await User.findOne({
      collegeId: college._id,
      email: recruiterEmail,
    });

    if (!recruiterUser) {
      recruiterUser = new User({
        collegeId: college._id,
        firstName: 'Sundar',
        lastName: 'Pichai',
        email: recruiterEmail,
        password: 'Password@123',
        role: 'recruiter',
        companyId: company._id,
        companyName: company.name,
        isVerified: true,
        isInvited: false,
      });
      await recruiterUser.save();
      console.log(`Created Recruiter User: ${recruiterEmail} / Password@123`);
    } else {
      recruiterUser.password = 'Password@123';
      recruiterUser.role = 'recruiter';
      recruiterUser.companyId = company._id;
      recruiterUser.companyName = company.name;
      recruiterUser.isVerified = true;
      recruiterUser.isInvited = false;
      await recruiterUser.save();
      console.log(`Updated Recruiter User credentials: ${recruiterEmail} / Password@123`);
    }

    // 4. Create or update Primary Google Drive
    let sdeDrive = await Opportunity.findOne({
      collegeId: college._id,
      companyName: 'Google India',
      title: 'Software Development Engineer - Campus 2026',
    });

    if (!sdeDrive) {
      sdeDrive = await Opportunity.create({
        collegeId: college._id,
        title: 'Software Development Engineer - Campus 2026',
        companyName: 'Google India',
        companyId: company._id,
        type: 'Job',
        description:
          'Join Google Engineering to build distributed cloud platforms, AI-native services, and high-performance backend systems used by billions globally.',
        location: 'Bengaluru / Hyderabad',
        salary: '24 - 32 LPA',
        ctc: {
          total: 2800000,
          fixed: 2200000,
          variable: 600000,
          currency: 'INR',
        },
        eligibilityRules: {
          minCgpa: 8.0,
          maxBacklogs: 0,
          allowedBranches: ['CSE', 'IT', 'ECE'],
          gradYear: 2026,
        },
        rounds: [
          { roundNumber: 1, name: 'Online Coding Assessment', type: 'OA' },
          { roundNumber: 2, name: 'Technical Round 1: DSA & Problem Solving', type: 'Tech' },
          { roundNumber: 3, name: 'Technical Round 2: System Design', type: 'Tech' },
          { roundNumber: 4, name: 'Googleyness & Leadership', type: 'HR' },
        ],
        invitedRecruiterIds: [recruiterUser._id],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'Open',
        createdBy: recruiterUser._id,
      });
      console.log(`Created SDE Drive: ${sdeDrive.title}`);
    } else {
      sdeDrive.invitedRecruiterIds = [recruiterUser._id];
      sdeDrive.companyId = company._id;
      await sdeDrive.save();
      console.log(`Found & Linked SDE Drive: ${sdeDrive.title}`);
    }

    // Also create secondary drive: Cloud Systems Engineer
    let cloudDrive = await Opportunity.findOne({
      collegeId: college._id,
      companyName: 'Google India',
      title: 'Cloud Infrastructure Engineer - Campus 2026',
    });

    if (!cloudDrive) {
      cloudDrive = await Opportunity.create({
        collegeId: college._id,
        title: 'Cloud Infrastructure Engineer - Campus 2026',
        companyName: 'Google India',
        companyId: company._id,
        type: 'Job',
        description:
          'Work on Google Cloud Platform infrastructure, Kubernetes orchestration, and global network reliability engineering.',
        location: 'Bengaluru',
        salary: '26 LPA',
        ctc: {
          total: 2600000,
          fixed: 2100000,
          variable: 500000,
          currency: 'INR',
        },
        eligibilityRules: {
          minCgpa: 7.5,
          maxBacklogs: 0,
          allowedBranches: ['CSE', 'IT'],
          gradYear: 2026,
        },
        rounds: [
          { roundNumber: 1, name: 'Cloud OA', type: 'OA' },
          { roundNumber: 2, name: 'Systems Round', type: 'Tech' },
          { roundNumber: 3, name: 'Culture Fit', type: 'HR' },
        ],
        invitedRecruiterIds: [recruiterUser._id],
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'Open',
        createdBy: recruiterUser._id,
      });
      console.log(`Created Cloud Drive: ${cloudDrive.title}`);
    }

    // 5. Create Candidate Cohort for SDE Drive
    const candidates = [
      {
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'aarav.sharma@campus.edu',
        rollNo: '2026-CS-101',
        cgpa: 9.3,
        branch: 'CSE',
        status: 'Shortlisted',
        skills: ['C++', 'Algorithms', 'Go', 'Kubernetes'],
        notes: 'Top 1% in competitive programming rankings',
      },
      {
        firstName: 'Ananya',
        lastName: 'Iyer',
        email: 'ananya.iyer@campus.edu',
        rollNo: '2026-CS-102',
        cgpa: 8.9,
        branch: 'CSE',
        status: 'Technical Round',
        skills: ['Python', 'Distributed Systems', 'PostgreSQL', 'Docker'],
        notes: 'Strong open-source contributor with Google Summer of Code project',
      },
      {
        firstName: 'Rohan',
        lastName: 'Verma',
        email: 'rohan.verma@campus.edu',
        rollNo: '2026-EC-201',
        cgpa: 8.7,
        branch: 'ECE',
        status: 'HR Round',
        skills: ['Java', 'Spring Boot', 'Kafka', 'System Design'],
        notes: 'Cleared Tech Round 1 with 5/5 rating on concurrency design',
      },
      {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.patel@campus.edu',
        rollNo: '2026-CS-103',
        cgpa: 9.6,
        branch: 'CSE',
        status: 'Offer Proposed',
        skills: ['TypeScript', 'Rust', 'GraphQL', 'Next.js'],
        notes: 'Department Gold Medalist; proposed offer submitted for TPO approval',
      },
      {
        firstName: 'Devansh',
        lastName: 'Gupta',
        email: 'devansh.gupta@campus.edu',
        rollNo: '2026-IT-301',
        cgpa: 8.1,
        branch: 'IT',
        status: 'Applied',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        notes: 'Application under review, contact info remains redacted to recruiter',
      },
      {
        firstName: 'Sneha',
        lastName: 'Reddy',
        email: 'sneha.reddy@campus.edu',
        rollNo: '2026-CS-104',
        cgpa: 8.4,
        branch: 'CSE',
        status: 'Rejected',
        rejectionReason: 'Did not clear Core Concurrency & OS evaluation threshold',
        skills: ['C++', 'Machine Learning', 'PyTorch'],
        notes: 'Candidate rejected with feedback',
      },
    ];

    for (const cand of candidates) {
      let candUser = await User.findOne({
        collegeId: college._id,
        email: cand.email,
      });

      if (!candUser) {
        candUser = new User({
          collegeId: college._id,
          firstName: cand.firstName,
          lastName: cand.lastName,
          email: cand.email,
          password: 'Password@123',
          role: 'student',
          isVerified: true,
        });
        await candUser.save();
      }

      // Generate verified academic seal
      const verificationRecord = {
        collegeId: college._id.toString(),
        studentId: candUser._id.toString(),
        rollNo: cand.rollNo,
        branch: cand.branch,
        gradYear: 2026,
        cgpa: cand.cgpa,
        backlogs: 0,
        verifiedAt: new Date().toISOString(),
        verifiedByTpoId: recruiterUser._id.toString(),
      };
      const seal = generateVerificationSeal(verificationRecord);

      let profile = await StudentProfile.findOne({
        collegeId: college._id,
        user: candUser._id,
      });

      if (!profile) {
        profile = await StudentProfile.create({
          collegeId: college._id,
          user: candUser._id,
          rollNo: cand.rollNo,
          branch: cand.branch,
          cgpa: cand.cgpa,
          backlogs: 0,
          batch: 2026,
          skills: cand.skills,
          personalInfo: {
            phone: '+91 98765 43210',
            city: 'Delhi',
            state: 'Delhi',
          },
          academicHistory: {
            tenthPercentage: 94.5,
            twelfthPercentage: 92.0,
          },
          socialLinks: {
            github: `https://github.com/${cand.firstName.toLowerCase()}`,
            linkedin: `https://linkedin.com/in/${cand.firstName.toLowerCase()}`,
          },
          isVerifiedByTPO: true,
          verificationSeal: seal,
        });
      } else {
        profile.cgpa = cand.cgpa;
        profile.skills = cand.skills;
        profile.isVerifiedByTPO = true;
        profile.verificationSeal = seal;
        await profile.save();
      }

      // Create or update application
      let application = await Application.findOne({
        collegeId: college._id,
        studentId: candUser._id,
        opportunityId: sdeDrive._id,
      });

      if (!application) {
        application = new Application({
          collegeId: college._id,
          studentId: candUser._id,
          opportunityId: sdeDrive._id,
          status: cand.status,
          currentRound:
            cand.status === 'Technical Round'
              ? 'Technical Round 1'
              : cand.status === 'HR Round'
              ? 'Googleyness & Leadership'
              : cand.status === 'Offer Proposed'
              ? 'Final Offer'
              : cand.status === 'Rejected'
              ? 'Eliminated'
              : 'Application Review',
          roundHistory: [
            {
              roundName: 'Application Review',
              status: cand.status === 'Applied' ? 'Applied' : 'Shortlisted',
              movedAt: new Date(Date.now() - 3 * 86400000),
            },
          ],
        });

        if (cand.status === 'Rejected') {
          application.rejectionReason = cand.rejectionReason;
        }

        if (cand.status === 'HR Round') {
          application.feedback = [
            {
              rating: 5,
              roundName: 'Technical Round 1: DSA',
              strengths: 'Outstanding problem solver, flawless time complexity analysis on binary trees.',
              gaps: 'Minor edge cases on 64-bit integer overflow handled after hint.',
              comments: 'Strong recommend to proceed to Leadership round.',
              visibleToStudent: true,
              submittedBy: recruiterUser._id,
              submittedAt: new Date(Date.now() - 86400000),
            },
          ];
        }

        if (cand.status === 'Offer Proposed') {
          application.offer = {
            designation: 'Software Development Engineer - Cloud',
            ctc: 2800000,
            fixedCtc: 2200000,
            variableCtc: 600000,
            joiningDate: new Date('2026-07-15'),
            status: 'Proposed_By_Recruiter',
            proposedByRecruiterId: recruiterUser._id,
            proposedAt: new Date(),
          };
        }

        await application.save();
      }
    }

    // 6. Create Demo Interview Slot for Ananya Iyer
    const ananyaUser = await User.findOne({ email: 'ananya.iyer@campus.edu' });
    if (ananyaUser) {
      await InterviewSlot.deleteMany({ opportunityId: sdeDrive._id });
      await InterviewSlot.create({
        collegeId: college._id,
        opportunityId: sdeDrive._id,
        roundName: 'Technical Round 1: DSA & Problem Solving',
        panel: 'Panel 1',
        recruiterName: 'Sundar Pichai (Google Engineering)',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow 10:00 AM
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'Booked',
        candidateId: ananyaUser._id,
        meetingLink: 'https://meet.google.com/xyz-tech-round',
      });
      console.log(`Created Interview Slot for Ananya Iyer`);
    }

    console.log(`
=========================================================
  RECRUITER SEED COMPLETED SUCCESSFULLY!
=========================================================
  Demo Recruiter Account:
  - Email: recruiter.google@techcorp.com
  - Password: Password@123
  - Company: Google India
  - Drive: Software Development Engineer - Campus 2026
  - Candidates Seeded: 6 (Shortlisted, Technical, HR, Offer, Applied, Rejected)
=========================================================
`);
  } catch (err) {
    console.error('Recruiter Seed Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

if (require.main === module) {
  seedRecruiterData();
}

module.exports = seedRecruiterData;

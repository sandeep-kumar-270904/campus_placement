const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const xlsx = require('xlsx');

const {
  calculateMedian,
  calculateAverage,
  generateNirfNaacStats,
  generateBrochureData,
  generateCompanyWiseReport,
  generateDepartmentStats,
  generateUnplacedRoster,
  generateDriveFunnelReport,
  getYoyComparison,
} = require('../src/services/reports/reportEngine');

const { generatePdfReportBuffer } = require('../src/services/reports/pdfReportGenerator');
const { generateXlsxReportBuffer } = require('../src/services/reports/xlsxReportGenerator');
const { buildWeeklyDigestHtml } = require('../src/services/reports/weeklyDigestService');

/**
 * -----------------------------------------------------------------------------
 * GROUND-TRUTH SEEDED DATASET (KNOWN TOTALS BENCHMARK)
 * Cohort Size: 20 Students (Graduation Year 2026)
 * - 8 Computer Science (CSE)
 * - 6 Electronics & Communication (ECE)
 * - 6 Mechanical Engineering (MECH)
 *
 * Known Placement Outcomes:
 * - 8 On-Campus Placed:
 *   CSE: Google (28.0), Microsoft (22.0), Amazon (20.0), Cisco (18.0)
 *   ECE: Qualcomm (16.0), Texas Instruments (14.0)
 *   MECH: Tata Motors (8.0), L&T Technology (6.0)
 * - 2 Off-Campus Placed:
 *   ECE: NVIDIA (30.0)
 *   MECH: Tesla Energy (24.0)
 * Total Placed = 10 (Exact Placement Rate = 50.0%)
 *
 * Placed CTC Array: [6.0, 8.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 28.0, 30.0]
 * Even count = 10 -> Middle Pair = 18.0 and 20.0
 * -> Exact Median CTC = (18.0 + 20.0) / 2 = 19.00 LPA
 * -> Exact Average CTC = 186.0 / 10 = 18.60 LPA
 * -> Exact Highest CTC = 30.00 LPA
 *
 * Known Non-Employment Progressions:
 * - 3 Verified Higher Studies:
 *   CSE: Stanford University (MS CS)
 *   CSE: Carnegie Mellon University (MS Software Engineering)
 *   ECE: IIT Bombay (M.Tech VLSI)
 * - 1 Verified Entrepreneurship:
 *   CSE: RoboAI Systems (DeepTech Founder)
 *
 * Total Progressed = 10 Placed + 3 Higher Studies + 1 Entrepreneurship = 14
 * -> Exact NIRF Progression Rate = (14 / 20) * 100 = 70.0%
 *
 * Known Unplaced Students = 6 Students (S08, S13, S14, S18, S19, S20)
 * -----------------------------------------------------------------------------
 */

function buildBenchmarkCohort() {
  const collegeId = '507f1f77bcf86cd799439001';

  // 1. Seeded 20 Students
  const profiles = [
    // CSE Cohort (8 students)
    {
      _id: 'prof_cs_01',
      user: { _id: 'user_cs_01', firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.cs@college.edu' },
      rollNo: 'CS202601',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.4,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Google India', role: 'Software Engineer', ctc: 28.0 },
    },
    {
      _id: 'prof_cs_02',
      user: { _id: 'user_cs_02', firstName: 'Priya', lastName: 'Verma', email: 'priya.cs@college.edu' },
      rollNo: 'CS202602',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.1,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Microsoft', role: 'Systems Engineer', ctc: 22.0 },
    },
    {
      _id: 'prof_cs_03',
      user: { _id: 'user_cs_03', firstName: 'Rohan', lastName: 'Iyer', email: 'rohan.cs@college.edu' },
      rollNo: 'CS202603',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.8,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Amazon', role: 'SDE-1', ctc: 20.0 },
    },
    {
      _id: 'prof_cs_04',
      user: { _id: 'user_cs_04', firstName: 'Ananya', lastName: 'Nair', email: 'ananya.cs@college.edu' },
      rollNo: 'CS202604',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.6,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Cisco', role: 'Software Engineer', ctc: 18.0 },
    },
    {
      _id: 'prof_cs_05',
      user: { _id: 'user_cs_05', firstName: 'Siddharth', lastName: 'Patel', email: 'sid.cs@college.edu' },
      rollNo: 'CS202605',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.7,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
    {
      _id: 'prof_cs_06',
      user: { _id: 'user_cs_06', firstName: 'Meera', lastName: 'Sundaram', email: 'meera.cs@college.edu' },
      rollNo: 'CS202606',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.5,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
    {
      _id: 'prof_cs_07',
      user: { _id: 'user_cs_07', firstName: 'Kabir', lastName: 'Deshmukh', email: 'kabir.cs@college.edu' },
      rollNo: 'CS202607',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.2,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
    {
      _id: 'prof_cs_08',
      user: { _id: 'user_cs_08', firstName: 'Karan', lastName: 'Bhatia', email: 'karan.cs@college.edu' },
      rollNo: 'CS202608',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 6.8,
      activeBacklogs: 3,
      isVerifiedByTPO: false,
      isPlaced: false,
    },

    // ECE Cohort (6 students)
    {
      _id: 'prof_ec_09',
      user: { _id: 'user_ec_09', firstName: 'Vikram', lastName: 'Rao', email: 'vikram.ec@college.edu' },
      rollNo: 'EC202609',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 8.5,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Qualcomm', role: 'Hardware Engineer', ctc: 16.0 },
    },
    {
      _id: 'prof_ec_10',
      user: { _id: 'user_ec_10', firstName: 'Sneha', lastName: 'Menon', email: 'sneha.ec@college.edu' },
      rollNo: 'EC202610',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 8.3,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Texas Instruments', role: 'Analog Design Engineer', ctc: 14.0 },
    },
    {
      _id: 'prof_ec_11',
      user: { _id: 'user_ec_11', firstName: 'Aditya', lastName: 'Kulkarni', email: 'aditya.ec@college.edu' },
      rollNo: 'EC202611',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 9.2,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false, // Placed off-campus via ExternalOutcome
    },
    {
      _id: 'prof_ec_12',
      user: { _id: 'user_ec_12', firstName: 'Divya', lastName: 'Reddy', email: 'divya.ec@college.edu' },
      rollNo: 'EC202612',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 9.0,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
    {
      _id: 'prof_ec_13',
      user: { _id: 'user_ec_13', firstName: 'Arjun', lastName: 'Gupta', email: 'arjun.ec@college.edu' },
      rollNo: 'EC202613',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 7.1,
      activeBacklogs: 1,
      isVerifiedByTPO: false,
      isPlaced: false,
    },
    {
      _id: 'prof_ec_14',
      user: { _id: 'user_ec_14', firstName: 'Neha', lastName: 'Joshi', email: 'neha.ec@college.edu' },
      rollNo: 'EC202614',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 7.4,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },

    // MECH Cohort (6 students)
    {
      _id: 'prof_me_15',
      user: { _id: 'user_me_15', firstName: 'Harsh', lastName: 'Chauhan', email: 'harsh.me@college.edu' },
      rollNo: 'ME202615',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 7.9,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'Tata Motors', role: 'Automotive Design Engineer', ctc: 8.0 },
    },
    {
      _id: 'prof_me_16',
      user: { _id: 'user_me_16', firstName: 'Tanvi', lastName: 'Bose', email: 'tanvi.me@college.edu' },
      rollNo: 'ME202616',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 7.6,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: true,
      placedDetails: { companyName: 'L&T Technology', role: 'Design Engineer', ctc: 6.0 },
    },
    {
      _id: 'prof_me_17',
      user: { _id: 'user_me_17', firstName: 'Kavya', lastName: 'Pandey', email: 'kavya.me@college.edu' },
      rollNo: 'ME202617',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 8.9,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false, // Placed off-campus via ExternalOutcome
    },
    {
      _id: 'prof_me_18',
      user: { _id: 'user_me_18', firstName: 'Manish', lastName: 'Tiwari', email: 'manish.me@college.edu' },
      rollNo: 'ME202618',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 7.2,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
    {
      _id: 'prof_me_19',
      user: { _id: 'user_me_19', firstName: 'Deepak', lastName: 'Malhotra', email: 'deepak.me@college.edu' },
      rollNo: 'ME202619',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 6.7,
      activeBacklogs: 2,
      isVerifiedByTPO: false,
      isPlaced: false,
    },
    {
      _id: 'prof_me_20',
      user: { _id: 'user_me_20', firstName: 'Ritu', lastName: 'Saxena', email: 'ritu.me@college.edu' },
      rollNo: 'ME202620',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      cgpa: 7.3,
      activeBacklogs: 0,
      isVerifiedByTPO: true,
      isPlaced: false,
    },
  ];

  // 2. Seeded Drives (Opportunities)
  const drives = [
    {
      _id: 'drive_google',
      companyName: 'Google India',
      title: 'Software Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 28.0, fixed: 22.0 },
      createdAt: '2026-08-01T00:00:00.000Z',
    },
    {
      _id: 'drive_msft',
      companyName: 'Microsoft',
      title: 'Systems Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 22.0, fixed: 18.0 },
      createdAt: '2026-08-10T00:00:00.000Z',
    },
    {
      _id: 'drive_amazon',
      companyName: 'Amazon',
      title: 'SDE-1',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 20.0, fixed: 16.0 },
      createdAt: '2026-08-15T00:00:00.000Z',
    },
    {
      _id: 'drive_cisco',
      companyName: 'Cisco',
      title: 'Software Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 18.0, fixed: 14.0 },
      createdAt: '2026-08-20T00:00:00.000Z',
    },
    {
      _id: 'drive_qualcomm',
      companyName: 'Qualcomm',
      title: 'Hardware Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 16.0, fixed: 13.0 },
      createdAt: '2026-08-25T00:00:00.000Z',
    },
    {
      _id: 'drive_ti',
      companyName: 'Texas Instruments',
      title: 'Analog Design Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 14.0, fixed: 11.0 },
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      _id: 'drive_tata',
      companyName: 'Tata Motors',
      title: 'Automotive Design Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 8.0, fixed: 7.0 },
      createdAt: '2026-09-10T00:00:00.000Z',
    },
    {
      _id: 'drive_lnt',
      companyName: 'L&T Technology',
      title: 'Design Engineer',
      type: 'Job',
      jobType: 'Full-time',
      ctc: { total: 6.0, fixed: 5.5 },
      createdAt: '2026-09-15T00:00:00.000Z',
    },
  ];

  // 3. Seeded Applications across stages
  const applications = [
    // Google India: 12 applied, 8 OA, 4 Tech, 2 HR, 1 Placed (S01)
    { opportunityId: 'drive_google', studentId: 'user_cs_01', branch: 'Computer Science', status: 'Placed', offer: { status: 'Accepted', ctc: 28.0 } },
    { opportunityId: 'drive_google', studentId: 'user_cs_02', branch: 'Computer Science', status: 'HR Round' },
    { opportunityId: 'drive_google', studentId: 'user_cs_03', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_google', studentId: 'user_cs_04', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_google', studentId: 'user_cs_05', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_google', studentId: 'user_cs_06', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_google', studentId: 'user_cs_07', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_google', studentId: 'user_cs_08', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_google', studentId: 'user_ec_09', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_google', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_google', studentId: 'user_ec_11', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_google', studentId: 'user_ec_12', branch: 'Electronics & Communication', status: 'Applied' },

    // Microsoft: 10 applied, 6 OA, 3 Tech, 2 HR, 1 Placed (S02)
    { opportunityId: 'drive_msft', studentId: 'user_cs_02', branch: 'Computer Science', status: 'Placed', offer: { status: 'Accepted', ctc: 22.0 } },
    { opportunityId: 'drive_msft', studentId: 'user_cs_03', branch: 'Computer Science', status: 'HR Round' },
    { opportunityId: 'drive_msft', studentId: 'user_cs_04', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_msft', studentId: 'user_cs_05', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_msft', studentId: 'user_cs_06', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_msft', studentId: 'user_cs_07', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_msft', studentId: 'user_cs_08', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_msft', studentId: 'user_ec_09', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_msft', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_msft', studentId: 'user_ec_11', branch: 'Electronics & Communication', status: 'Applied' },

    // Amazon: 14 applied, 10 OA, 5 Tech, 2 HR, 1 Placed (S03)
    { opportunityId: 'drive_amazon', studentId: 'user_cs_03', branch: 'Computer Science', status: 'Placed', offer: { status: 'Accepted', ctc: 20.0 } },
    { opportunityId: 'drive_amazon', studentId: 'user_cs_04', branch: 'Computer Science', status: 'HR Round' },
    { opportunityId: 'drive_amazon', studentId: 'user_cs_05', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_amazon', studentId: 'user_cs_06', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_amazon', studentId: 'user_cs_07', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_amazon', studentId: 'user_cs_08', branch: 'Computer Science', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_09', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_11', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_12', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_13', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_amazon', studentId: 'user_ec_14', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_amazon', studentId: 'user_me_15', branch: 'Mechanical Engineering', status: 'Applied' },
    { opportunityId: 'drive_amazon', studentId: 'user_me_16', branch: 'Mechanical Engineering', status: 'Applied' },

    // Cisco: 8 applied, 6 OA, 3 Tech, 1 HR, 1 Placed (S04)
    { opportunityId: 'drive_cisco', studentId: 'user_cs_04', branch: 'Computer Science', status: 'Placed', offer: { status: 'Accepted', ctc: 18.0 } },
    { opportunityId: 'drive_cisco', studentId: 'user_cs_07', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_cisco', studentId: 'user_cs_08', branch: 'Computer Science', status: 'Technical Round' },
    { opportunityId: 'drive_cisco', studentId: 'user_ec_09', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_cisco', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_cisco', studentId: 'user_ec_13', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_cisco', studentId: 'user_ec_14', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_cisco', studentId: 'user_me_18', branch: 'Mechanical Engineering', status: 'Applied' },

    // Qualcomm: 6 applied, 4 OA, 2 Tech, 1 HR, 1 Placed (S09)
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_09', branch: 'Electronics & Communication', status: 'Placed', offer: { status: 'Accepted', ctc: 16.0 } },
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Technical Round' },
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_11', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_12', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_13', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_qualcomm', studentId: 'user_ec_14', branch: 'Electronics & Communication', status: 'Applied' },

    // Texas Instruments: 5 applied, 3 OA, 2 Tech, 1 HR, 1 Placed (S10)
    { opportunityId: 'drive_ti', studentId: 'user_ec_10', branch: 'Electronics & Communication', status: 'Placed', offer: { status: 'Accepted', ctc: 14.0 } },
    { opportunityId: 'drive_ti', studentId: 'user_ec_11', branch: 'Electronics & Communication', status: 'Technical Round' },
    { opportunityId: 'drive_ti', studentId: 'user_ec_12', branch: 'Electronics & Communication', status: 'Online Assessment' },
    { opportunityId: 'drive_ti', studentId: 'user_ec_13', branch: 'Electronics & Communication', status: 'Applied' },
    { opportunityId: 'drive_ti', studentId: 'user_ec_14', branch: 'Electronics & Communication', status: 'Applied' },

    // Tata Motors: 6 applied, 4 OA, 2 Tech, 1 HR, 1 Placed (S15)
    { opportunityId: 'drive_tata', studentId: 'user_me_15', branch: 'Mechanical Engineering', status: 'Placed', offer: { status: 'Accepted', ctc: 8.0 } },
    { opportunityId: 'drive_tata', studentId: 'user_me_16', branch: 'Mechanical Engineering', status: 'Technical Round' },
    { opportunityId: 'drive_tata', studentId: 'user_me_17', branch: 'Mechanical Engineering', status: 'Online Assessment' },
    { opportunityId: 'drive_tata', studentId: 'user_me_18', branch: 'Mechanical Engineering', status: 'Online Assessment' },
    { opportunityId: 'drive_tata', studentId: 'user_me_19', branch: 'Mechanical Engineering', status: 'Applied' },
    { opportunityId: 'drive_tata', studentId: 'user_me_20', branch: 'Mechanical Engineering', status: 'Applied' },

    // L&T Technology: 5 applied, 3 OA, 2 Tech, 1 HR, 1 Placed (S16)
    { opportunityId: 'drive_lnt', studentId: 'user_me_16', branch: 'Mechanical Engineering', status: 'Placed', offer: { status: 'Accepted', ctc: 6.0 } },
    { opportunityId: 'drive_lnt', studentId: 'user_me_17', branch: 'Mechanical Engineering', status: 'Technical Round' },
    { opportunityId: 'drive_lnt', studentId: 'user_me_18', branch: 'Mechanical Engineering', status: 'Online Assessment' },
    { opportunityId: 'drive_lnt', studentId: 'user_me_19', branch: 'Mechanical Engineering', status: 'Applied' },
    { opportunityId: 'drive_lnt', studentId: 'user_me_20', branch: 'Mechanical Engineering', status: 'Applied' },
  ];

  // 4. Seeded External Outcomes (Off-Campus, Higher Studies, Entrepreneurship)
  const externalOutcomes = [
    // Off-Campus Placement (ECE): NVIDIA @ 30 LPA
    {
      studentId: 'user_ec_11',
      category: 'Off-Campus Placement',
      verificationStatus: 'verified',
      offCampusDetails: { companyName: 'NVIDIA', role: 'ASIC Design Engineer', ctcLpa: 30.0 },
    },
    // Off-Campus Placement (MECH): Tesla Energy @ 24 LPA
    {
      studentId: 'user_me_17',
      category: 'Off-Campus Placement',
      verificationStatus: 'verified',
      offCampusDetails: { companyName: 'Tesla Energy', role: 'Thermal Systems Engineer', ctcLpa: 24.0 },
    },
    // Higher Studies (CSE): Stanford University
    {
      studentId: 'user_cs_05',
      category: 'Higher Studies',
      verificationStatus: 'verified',
      higherStudiesDetails: { universityName: 'Stanford University', degree: 'MS', country: 'USA' },
    },
    // Higher Studies (CSE): Carnegie Mellon University
    {
      studentId: 'user_cs_06',
      category: 'Higher Studies',
      verificationStatus: 'verified',
      higherStudiesDetails: { universityName: 'Carnegie Mellon University', degree: 'MS', country: 'USA' },
    },
    // Higher Studies (ECE): IIT Bombay
    {
      studentId: 'user_ec_12',
      category: 'Higher Studies',
      verificationStatus: 'verified',
      higherStudiesDetails: { universityName: 'IIT Bombay', degree: 'M.Tech', country: 'India' },
    },
    // Entrepreneurship (CSE): RoboAI Systems
    {
      studentId: 'user_cs_07',
      category: 'Entrepreneurship',
      verificationStatus: 'verified',
      entrepreneurshipDetails: { startupName: 'RoboAI Systems', sector: 'AI & Robotics' },
    },
  ];

  // 5. Seeded Companies (Brochure Directory)
  const companies = [
    { name: 'Google India', tier: 'Super Dream', industry: 'Technology' },
    { name: 'Microsoft', tier: 'Super Dream', industry: 'Cloud & Software' },
    { name: 'Amazon', tier: 'Dream', industry: 'E-Commerce & Cloud' },
    { name: 'NVIDIA', tier: 'Super Dream', industry: 'Semiconductor / AI' },
    { name: 'Cisco', tier: 'Dream', industry: 'Networking' },
    { name: 'Qualcomm', tier: 'Dream', industry: 'Hardware / Telecom' },
    { name: 'Texas Instruments', tier: 'Core', industry: 'Semiconductor' },
    { name: 'Tesla Energy', tier: 'Super Dream', industry: 'Clean Energy & Auto' },
    { name: 'Tata Motors', tier: 'Core', industry: 'Automotive' },
    { name: 'L&T Technology', tier: 'Standard', industry: 'Engineering Services' },
  ];

  return {
    collegeId,
    profiles,
    drives,
    applications,
    externalOutcomes,
    companies,
  };
}

describe('Automated Reporting Benchmark: Testing Numbers Against Seeded Data with Known Totals', () => {
  const benchmark = buildBenchmarkCohort();

  describe('1. NAAC / NIRF / NBA Mandatory Placement Statistics', () => {
    it('Matches exact known totals for cohort, placed count, placement %, and progression rate', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      const { summary } = stats;

      // Assert Cohort Strength
      assert.strictEqual(summary.totalCohort, 20, 'Total graduating cohort must be exactly 20');

      // Assert Placed Count & Percentage
      // 8 On-Campus + 2 Off-Campus = 10 Placed Candidates
      assert.strictEqual(summary.placedCount, 10, 'Placed students count must be exactly 10');
      assert.strictEqual(summary.placementPercentage, 50.0, 'Placement rate must be exactly 50.0%');

      // Assert Progression Numbers
      // 3 Higher Studies (Stanford, CMU, IIT Bombay)
      assert.strictEqual(summary.higherStudiesCount, 3, 'Higher studies admissions must be exactly 3');
      // 1 Entrepreneurship (RoboAI Systems)
      assert.strictEqual(summary.entrepreneurshipCount, 1, 'Entrepreneurship count must be exactly 1');

      // Total Progression Rate = (10 placed + 3 higher studies + 1 entrepreneurship) / 20 = 70.0%
      assert.strictEqual(summary.progressionRate, 70.0, 'NIRF total progression rate must be exactly 70.0%');

      // Assert Compensation Metrics
      // Placed CTCs: [6, 8, 14, 16, 18, 20, 22, 24, 28, 30]
      // Median = (18 + 20) / 2 = 19.00 LPA
      assert.strictEqual(summary.medianCtc, 19.00, 'NIRF Median CTC must be exactly 19.00 LPA');

      // Average = 186.0 / 10 = 18.60 LPA
      assert.strictEqual(summary.averageCtc, 18.60, 'Average CTC must be exactly 18.60 LPA');

      // Highest CTC = 30.00 LPA (NVIDIA Off-Campus)
      assert.strictEqual(summary.highestCtc, 30.00, 'Highest CTC must be exactly 30.00 LPA');
    });

    it('Matches exact department-wise breakdown metrics for CSE, ECE, and MECH', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      const deptMap = {};
      stats.departmentBreakdown.forEach((d) => {
        deptMap[d.branch] = d;
      });

      // 1. Computer Science (8 students, 4 placed, 2 higher studies, median CTC 21.0, highest 28.0)
      const cse = deptMap['Computer Science'];
      assert.ok(cse, 'CSE breakdown must exist');
      assert.strictEqual(cse.total, 8, 'CSE total cohort must be 8');
      assert.strictEqual(cse.placed, 4, 'CSE placed count must be 4');
      assert.strictEqual(cse.placementPercentage, 50.0, 'CSE placement rate must be 50.0%');
      assert.strictEqual(cse.higherStudies, 2, 'CSE higher studies must be 2 (Stanford, CMU)');
      // CTCs: [18, 20, 22, 28] -> Median = (20 + 22) / 2 = 21.00 LPA
      assert.strictEqual(cse.medianCtc, 21.00, 'CSE median CTC must be 21.00 LPA');
      assert.strictEqual(cse.highestCtc, 28.00, 'CSE highest CTC must be 28.00 LPA (Google)');

      // 2. Electronics & Communication (6 students, 3 placed, 1 higher studies, median CTC 16.0, highest 30.0)
      const ece = deptMap['Electronics & Communication'];
      assert.ok(ece, 'ECE breakdown must exist');
      assert.strictEqual(ece.total, 6, 'ECE total cohort must be 6');
      assert.strictEqual(ece.placed, 3, 'ECE placed count must be 3 (Qualcomm, TI, NVIDIA)');
      assert.strictEqual(ece.placementPercentage, 50.0, 'ECE placement rate must be 50.0%');
      assert.strictEqual(ece.higherStudies, 1, 'ECE higher studies must be 1 (IIT Bombay)');
      // CTCs: [14, 16, 30] -> Median = 16.00 LPA
      assert.strictEqual(ece.medianCtc, 16.00, 'ECE median CTC must be 16.00 LPA');
      assert.strictEqual(ece.highestCtc, 30.00, 'ECE highest CTC must be 30.00 LPA (NVIDIA)');

      // 3. Mechanical Engineering (6 students, 3 placed, 0 higher studies, median CTC 8.0, highest 24.0)
      const mech = deptMap['Mechanical Engineering'];
      assert.ok(mech, 'MECH breakdown must exist');
      assert.strictEqual(mech.total, 6, 'MECH total cohort must be 6');
      assert.strictEqual(mech.placed, 3, 'MECH placed count must be 3 (Tata, L&T, Tesla)');
      assert.strictEqual(mech.placementPercentage, 50.0, 'MECH placement rate must be 50.0%');
      assert.strictEqual(mech.higherStudies, 0, 'MECH higher studies must be 0');
      // CTCs: [6, 8, 24] -> Median = 8.00 LPA
      assert.strictEqual(mech.medianCtc, 8.00, 'MECH median CTC must be 8.00 LPA');
      assert.strictEqual(mech.highestCtc, 24.00, 'MECH highest CTC must be 24.00 LPA (Tesla Energy)');
    });

    it('Emits audit row callset with exact candidate progression states', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      assert.strictEqual(stats.rows.length, 20, 'Audit rows count must match total cohort');

      // Verify specific candidate progression mapping
      const aaravRow = stats.rows.find((r) => r['Roll Number'] === 'CS202601');
      assert.strictEqual(aaravRow['Progression Status'], 'Placed');
      assert.strictEqual(aaravRow['Employer / Institution'], 'Google India');
      assert.strictEqual(aaravRow['Compensation / Status'], '28 LPA');

      const stanfordRow = stats.rows.find((r) => r['Roll Number'] === 'CS202605');
      assert.strictEqual(stanfordRow['Progression Status'], 'Higher Studies');
      assert.ok(stanfordRow['Employer / Institution'].includes('Stanford University'));
      assert.strictEqual(stanfordRow['Compensation / Status'], 'Admitted');

      const founderRow = stats.rows.find((r) => r['Roll Number'] === 'CS202607');
      assert.strictEqual(founderRow['Progression Status'], 'Entrepreneurship');
      assert.ok(founderRow['Employer / Institution'].includes('RoboAI Systems'));
      assert.strictEqual(founderRow['Compensation / Status'], 'Self-Employed');

      const unplacedRow = stats.rows.find((r) => r['Roll Number'] === 'CS202608');
      assert.strictEqual(unplacedRow['Progression Status'], 'Seeking Employment');
      assert.strictEqual(unplacedRow['Employer / Institution'], '—');
      assert.strictEqual(unplacedRow['Compensation / Status'], '—');
    });
  });

  describe('2. Annual Placement Brochure Dataset', () => {
    it('Filters precisely for placed students and extracts marquee recruiters', async () => {
      const brochure = await generateBrochureData(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      // Must only contain placed students
      assert.strictEqual(brochure.rows.length, 10, 'Brochure must contain exactly 10 placed rows');

      // Summary must align with NIRF totals
      assert.strictEqual(brochure.summary.placedCount, 10);
      assert.strictEqual(brochure.summary.medianCtc, 19.00);
      assert.strictEqual(brochure.summary.highestCtc, 30.00);

      // Marquee recruiters must include top tier companies
      const companyNames = brochure.marqueeRecruiters.map((c) => c.name);
      assert.ok(companyNames.includes('Google India'));
      assert.ok(companyNames.includes('Microsoft'));
      assert.ok(companyNames.includes('NVIDIA'));
      assert.ok(companyNames.includes('Tesla Energy'));
    });
  });

  describe('3. Corporate Recruiter Directory & Hiring Breakdown (Company-Wise Report)', () => {
    it('Aggregates exact drive counts, applications, and final offers across corporate partners', async () => {
      const report = await generateCompanyWiseReport(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      assert.strictEqual(report.summary.totalRecruiters, 8, 'Must report 8 distinct campus recruiters');
      assert.strictEqual(report.summary.totalOffers, 8, 'Must report 8 total campus offers extended');

      const rowMap = {};
      report.rows.forEach((r) => {
        rowMap[r['Company Name']] = r;
      });

      // Google India: 12 applicants, 1 offer, 28 LPA
      const google = rowMap['Google India'];
      assert.ok(google);
      assert.strictEqual(google['Total Applications'], 12);
      assert.strictEqual(google['Final Offers Extended'], 1);
      assert.strictEqual(google['Total Package (LPA)'], 28.0);
      assert.ok(google['Target Disciplines'].includes('Computer Science'));

      // Amazon: 14 applicants, 1 offer, 20 LPA
      const amazon = rowMap['Amazon'];
      assert.ok(amazon);
      assert.strictEqual(amazon['Total Applications'], 14);
      assert.strictEqual(amazon['Final Offers Extended'], 1);

      // Texas Instruments: 5 applicants, 1 offer, 14 LPA
      const ti = rowMap['Texas Instruments'];
      assert.ok(ti);
      assert.strictEqual(ti['Total Applications'], 5);
      assert.strictEqual(ti['Final Offers Extended'], 1);
      assert.ok(ti['Target Disciplines'].includes('Electronics & Communication'));
    });
  });

  describe('4. Department-Wise Placement Statistics Report', () => {
    it('Generates formatted department table with exact percentages and salary metrics', async () => {
      const deptReport = await generateDepartmentStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      assert.strictEqual(deptReport.rows.length, 3, 'Must have 3 department rows (CSE, ECE, MECH)');

      const cseRow = deptReport.rows.find((r) => r['Academic Department'] === 'Computer Science');
      assert.strictEqual(cseRow['Total Enrolled Students'], 8);
      assert.strictEqual(cseRow['Placed Candidates'], 4);
      assert.strictEqual(cseRow['Placement Rate (%)'], '50%');
      assert.strictEqual(cseRow['Higher Studies Admissions'], 2);
      assert.strictEqual(cseRow['Median CTC (LPA)'], '21 LPA');
      assert.strictEqual(cseRow['Highest CTC (LPA)'], '28 LPA');

      const eceRow = deptReport.rows.find((r) => r['Academic Department'] === 'Electronics & Communication');
      assert.strictEqual(eceRow['Total Enrolled Students'], 6);
      assert.strictEqual(eceRow['Placed Candidates'], 3);
      assert.strictEqual(eceRow['Median CTC (LPA)'], '16 LPA');
      assert.strictEqual(eceRow['Highest CTC (LPA)'], '30 LPA');

      const mechRow = deptReport.rows.find((r) => r['Academic Department'] === 'Mechanical Engineering');
      assert.strictEqual(mechRow['Total Enrolled Students'], 6);
      assert.strictEqual(mechRow['Placed Candidates'], 3);
      assert.strictEqual(mechRow['Median CTC (LPA)'], '8 LPA');
      assert.strictEqual(mechRow['Highest CTC (LPA)'], '24 LPA');
    });
  });

  describe('5. Unplaced Candidates Remediation Roster', () => {
    it('Identifies exactly the 6 unplaced candidates and their backlog status', async () => {
      const unplaced = await generateUnplacedRoster(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      assert.strictEqual(unplaced.summary.totalUnplaced, 6, 'Exactly 6 candidates must be unplaced');
      assert.strictEqual(unplaced.rows.length, 6, 'Must generate exactly 6 unplaced rows');

      const unplacedRolls = unplaced.rows.map((r) => r['Roll Number']);
      assert.deepStrictEqual(
        unplacedRolls.sort(),
        ['CS202608', 'EC202613', 'EC202614', 'ME202618', 'ME202619', 'ME202620'].sort(),
        'Unplaced candidate roll numbers must match known cohort exactly'
      );

      // Verify CS202608 details
      const karan = unplaced.rows.find((r) => r['Roll Number'] === 'CS202608');
      assert.strictEqual(karan['Active Backlogs'], 3);
      assert.strictEqual(karan['Academic Seal'], 'Pending');

      // Verify ME202618 details (verified, 0 backlogs)
      const manish = unplaced.rows.find((r) => r['Roll Number'] === 'ME202618');
      assert.strictEqual(manish['Active Backlogs'], 0);
      assert.strictEqual(manish['Academic Seal'], 'Verified');
    });
  });

  describe('6. Drive-Wise Recruitment Funnel Report', () => {
    it('Calculates stage-by-stage candidate progression and final conversion yield', async () => {
      const funnel = await generateDriveFunnelReport(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      assert.strictEqual(funnel.summary.totalDrives, 8, 'Total drives must be 8');
      assert.strictEqual(funnel.rows.length, 8, 'Funnel rows must be 8');

      const funnelMap = {};
      funnel.rows.forEach((r) => {
        funnelMap[r['Company Name']] = r;
      });

      // Google India: 12 applicants, 4 OA stage, 2 Tech, 1 HR, 1 Placed -> Total Offers = 1 -> Yield = 8.3%
      const gFunnel = funnelMap['Google India'];
      assert.ok(gFunnel);
      assert.strictEqual(gFunnel['Total Applicants'], 12);
      assert.strictEqual(gFunnel['Offers Extended'], 1);
      assert.strictEqual(gFunnel['Conversion Yield (%)'], '8.3%');

      // Microsoft: 10 applicants, 1 Placed -> Yield = 10.0%
      const msFunnel = funnelMap['Microsoft'];
      assert.ok(msFunnel);
      assert.strictEqual(msFunnel['Total Applicants'], 10);
      assert.strictEqual(msFunnel['Offers Extended'], 1);
      assert.strictEqual(msFunnel['Conversion Yield (%)'], '10.0%');

      // Amazon: 14 applicants, 1 Placed -> Yield = 7.1%
      const amzFunnel = funnelMap['Amazon'];
      assert.ok(amzFunnel);
      assert.strictEqual(amzFunnel['Total Applicants'], 14);
      assert.strictEqual(amzFunnel['Offers Extended'], 1);
      assert.strictEqual(amzFunnel['Conversion Yield (%)'], '7.1%');
    });
  });

  describe('7. Year-over-Year (YoY) Multi-Batch Comparison Analytics', () => {
    it('Generates progression trend across multiple graduating batches (2024, 2025, 2026)', async () => {
      // Mock multi-batch data
      const mockBatch2024 = {
        profiles: [
          { rollNo: '24CS01', branch: 'CSE', graduationYear: 2024, isPlaced: true, placedDetails: { ctc: 14.0 } },
          { rollNo: '24CS02', branch: 'CSE', graduationYear: 2024, isPlaced: true, placedDetails: { ctc: 16.0 } },
          { rollNo: '24CS03', branch: 'CSE', graduationYear: 2024, isPlaced: false },
        ],
        applications: [],
        externalOutcomes: [],
      };

      const mockBatch2025 = {
        profiles: [
          { rollNo: '25CS01', branch: 'CSE', graduationYear: 2025, isPlaced: true, placedDetails: { ctc: 18.0 } },
          { rollNo: '25CS02', branch: 'CSE', graduationYear: 2025, isPlaced: true, placedDetails: { ctc: 20.0 } },
          { rollNo: '25CS03', branch: 'CSE', graduationYear: 2025, isPlaced: true, placedDetails: { ctc: 22.0 } },
          { rollNo: '25CS04', branch: 'CSE', graduationYear: 2025, isPlaced: false },
        ],
        applications: [],
        externalOutcomes: [],
      };

      const injectedDataByYear = {
        2024: mockBatch2024,
        2025: mockBatch2025,
        2026: benchmark,
      };

      const yoy = await getYoyComparison(benchmark.collegeId, injectedDataByYear);

      assert.strictEqual(yoy.length, 3, 'Must return exactly 3 graduating years');
      assert.strictEqual(yoy[0].year, 2024);
      assert.strictEqual(yoy[0].totalCohort, 3);
      assert.strictEqual(yoy[0].placedCount, 2);
      assert.strictEqual(yoy[0].medianCtc, 15.00);

      assert.strictEqual(yoy[1].year, 2025);
      assert.strictEqual(yoy[1].totalCohort, 4);
      assert.strictEqual(yoy[1].placedCount, 3);
      assert.strictEqual(yoy[1].medianCtc, 20.00);

      assert.strictEqual(yoy[2].year, 2026);
      assert.strictEqual(yoy[2].totalCohort, 20);
      assert.strictEqual(yoy[2].placedCount, 10);
      assert.strictEqual(yoy[2].medianCtc, 19.00);
      assert.strictEqual(yoy[2].averageCtc, 18.60);
      assert.strictEqual(yoy[2].highestCtc, 30.00);
    });
  });

  describe('8. Multi-Format Output Generation (PDF, XLSX, CSV)', () => {
    it('Generates formatted multi-sheet XLSX matching ground-truth figures', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      const xlsxBuffer = generateXlsxReportBuffer({
        title: 'NAAC Mandatory Placement Audit Report',
        collegeName: 'National Engineering College',
        summary: stats.summary,
        rows: stats.rows,
        departmentBreakdown: stats.departmentBreakdown,
      });

      assert.ok(Buffer.isBuffer(xlsxBuffer));
      const wb = xlsx.read(xlsxBuffer, { type: 'buffer' });

      // Verify Sheets
      assert.ok(wb.SheetNames.includes('Audit Data'));
      assert.ok(wb.SheetNames.includes('Executive Summary'));
      assert.ok(wb.SheetNames.includes('Department Breakdown'));

      // Verify Audit Data rows
      const auditRows = xlsx.utils.sheet_to_json(wb.Sheets['Audit Data']);
      assert.strictEqual(auditRows.length, 20, 'Audit sheet must contain 20 student rows');

      // Verify Executive Summary values
      const summaryRows = xlsx.utils.sheet_to_json(wb.Sheets['Executive Summary']);
      const summaryMap = {};
      summaryRows.forEach((r) => {
        summaryMap[r.Metric] = r.Value;
      });

      assert.strictEqual(summaryMap['Total Graduating Cohort'], 20);
      assert.strictEqual(summaryMap['Placed Candidates'], 10);
      assert.strictEqual(summaryMap['Placement Rate (%)'], '50%');
      assert.strictEqual(summaryMap['Median CTC (LPA)'], '19 LPA');
      assert.strictEqual(summaryMap['Average CTC (LPA)'], '18.6 LPA');
      assert.strictEqual(summaryMap['Highest CTC (LPA)'], '30 LPA');
      assert.strictEqual(summaryMap['Total Progression Rate (%)'], '70%');
    });

    it('Generates valid PDF 1.4 binary buffer with header, summary KPI, and signatories', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      const pdfBuffer = generatePdfReportBuffer({
        title: 'NAAC / NIRF Placement Audit Report',
        collegeName: 'National Engineering College',
        batchYear: '2026',
        summary: stats.summary,
        rows: stats.rows,
        signatories: [
          { title: 'Training & Placement Officer', name: 'Dr. Placement Head' },
          { title: 'Dean of Academic Affairs', name: 'Prof. Academic Dean' },
          { title: 'Principal / Director', name: 'Dr. Director' },
        ],
      });

      assert.ok(Buffer.isBuffer(pdfBuffer));
      assert.ok(pdfBuffer.length > 1000, 'PDF buffer must contain vector content');

      const pdfString = pdfBuffer.toString('utf8');
      assert.ok(pdfString.startsWith('%PDF-1.4'), 'Must start with PDF 1.4 magic bytes');
      assert.ok(pdfString.includes('%%EOF'), 'Must terminate with standard PDF EOF marker');
      assert.ok(pdfString.includes('NATIONAL ENGINEERING COLLEGE'), 'Must include college title');
      assert.ok(pdfString.includes('Training & Placement Officer'), 'Must include signatory title');
      assert.ok(pdfString.includes('Prof. Academic Dean'), 'Must include signatory name');
    });

    it('Generates valid CSV stream matching ground-truth rows', async () => {
      const stats = await generateNirfNaacStats(
        benchmark.collegeId,
        { graduationYear: '2026' },
        benchmark
      );

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(stats.rows);
      xlsx.utils.book_append_sheet(wb, ws, 'NIRF Report');
      const csvBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'csv' });
      const csvText = csvBuffer.toString('utf8');

      assert.ok(csvText.includes('Roll Number,Student Name,Department / Branch,Graduation Year,CGPA,Progression Status,Employer / Institution,Compensation / Status'));
      assert.ok(csvText.includes('CS202601,Aarav Sharma,Computer Science,2026,9.4,Placed,Google India,28 LPA'));
      assert.ok(csvText.includes('CS202605,Siddharth Patel,Computer Science,2026,9.7,Higher Studies,"MS at Stanford University, USA",Admitted'));
      assert.ok(csvText.includes('CS202607,Kabir Deshmukh,Computer Science,2026,8.2,Entrepreneurship,RoboAI Systems (AI & Robotics),Self-Employed'));
      assert.ok(csvText.includes('CS202608,Karan Bhatia,Computer Science,2026,6.8,Seeking Employment,—,—'));
    });
  });

  describe('9. Weekly TPO Executive Digest Notification', () => {
    it('Compiles weekly metrics and renders HTML email with deep action links', () => {
      const digestPayload = {
        compiledAt: '2026-10-25T10:00:00.000Z',
        collegeName: 'National Engineering College',
        metrics: {
          openDrivesCount: 8,
          applicationsThisWeek: 75,
          pendingVerificationsCount: 6,
          upcomingInterviewsCount: 14,
          pendingOffersCount: 8,
        },
        openDrives: [
          {
            title: 'Software Engineer',
            company: 'Google India',
            package: '28 LPA',
            deadline: '2026-11-05',
            daysRemaining: 11,
          },
          {
            title: 'Hardware Engineer',
            company: 'Qualcomm',
            package: '16 LPA',
            deadline: '2026-11-08',
            daysRemaining: 14,
          },
        ],
        deepLinks: {
          drivesUrl: '/tpo/drives',
          verificationUrl: '/tpo/verification',
          scheduleUrl: '/tpo/schedule',
          reportsUrl: '/tpo/reports',
        },
      };

      const html = buildWeeklyDigestHtml(digestPayload);
      assert.ok(html.includes('Weekly Executive Briefing'));
      assert.ok(html.includes('National Engineering College'));
      assert.ok(html.includes('Google India'));
      assert.ok(html.includes('28 LPA'));
      assert.ok(html.includes('/tpo/drives'));
      assert.ok(html.includes('/tpo/verification'));
      assert.ok(html.includes('/tpo/schedule'));
      assert.ok(html.includes('/tpo/reports'));
    });
  });
});

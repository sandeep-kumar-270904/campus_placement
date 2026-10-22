const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const academicSchema = new mongoose.Schema({
  degree: { type: String, default: 'B.Tech' },
  institution: { type: String, default: '' },
  boardOrUniversity: { type: String, default: '' },
  yearOfPassing: { type: Number, default: 2026 },
  score: { type: Number, default: 0 },
  scoreType: { type: String, enum: ['CGPA', 'Percentage'], default: 'CGPA' },
  branch: { type: String, default: 'Computer Science' },
});

const verificationRecordSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Unverified', 'Verified', 'Needs re-verification'],
    default: 'Unverified',
    index: true,
  },
  verificationCode: {
    type: String,
    index: true,
    sparse: true,
  },
  hash: { type: String },
  signature: { type: String },
  keyId: { type: String },
  version: { type: Number, default: 1 },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signedPayload: { type: mongoose.Schema.Types.Mixed },
  rejectionReason: { type: String, default: '' },
}, { _id: false });

const studentProfileSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
  },
  branch: {
    type: String,
    default: 'Computer Science',
    trim: true,
  },
  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  backlogs: {
    type: Number,
    default: 0,
    min: 0,
  },
  graduationYear: {
    type: Number,
    default: 2026,
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  personalInfo: {
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    address: { type: String, default: '' },
  },
  academics: {
    tenth: academicSchema,
    twelfth: academicSchema,
    undergrad: academicSchema,
    currentCgpa: { type: Number, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    totalBacklogs: { type: Number, default: 0 },
    graduationYear: { type: Number, default: 2026 },
  },
  skills: [{ type: String }],
  projects: [{
    title: { type: String },
    description: { type: String },
    link: { type: String },
  }],
  experience: [{
    company: { type: String },
    role: { type: String },
    duration: { type: String },
    description: { type: String },
  }],
  careerGoals: { type: String, default: '' },
  isVerifiedByTPO: { type: Boolean, default: false },
  marksheetUrl: { type: String, default: '' },
  isPlaced: { type: Boolean, default: false },
  tpoNotes: [{
    note: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
  verificationRecord: {
    type: verificationRecordSchema,
    default: () => ({ status: 'Unverified' }),
  },
}, { timestamps: true });

// Virtual getter and setter for isVerified backward compatibility
studentProfileSchema.virtual('isVerified')
  .get(function () {
    return this.isVerifiedByTPO;
  })
  .set(function (val) {
    this.isVerifiedByTPO = val;
  });

studentProfileSchema.virtual('userId')
  .get(function () {
    return this.user;
  })
  .set(function (val) {
    this.user = val;
  });

studentProfileSchema.virtual('academicInfo')
  .get(function () {
    return {
      cgpa: this.academics?.currentCgpa ?? this.cgpa,
      activeBacklogs: this.academics?.activeBacklogs ?? this.backlogs,
      branch: this.academics?.undergrad?.branch ?? this.branch,
      graduationYear: this.academics?.graduationYear ?? this.graduationYear,
    };
  })
  .set(function (val) {
    if (!val) return;
    if (val.cgpa !== undefined) {
      this.cgpa = val.cgpa;
      if (!this.academics) this.academics = {};
      this.academics.currentCgpa = val.cgpa;
    }
    if (val.activeBacklogs !== undefined) {
      this.backlogs = val.activeBacklogs;
      if (!this.academics) this.academics = {};
      this.academics.activeBacklogs = val.activeBacklogs;
    }
    if (val.branch !== undefined) {
      this.branch = val.branch;
      if (!this.academics) this.academics = {};
      if (!this.academics.undergrad) this.academics.undergrad = {};
      this.academics.undergrad.branch = val.branch;
    }
  });

// Pre-save synchronization and automatic tamper invalidation hook
studentProfileSchema.pre('save', function (next) {
  // Sync top-level cgpa/backlogs/branch with academics subdocument
  if (this.cgpa !== undefined && (!this.academics.currentCgpa || this.isModified('cgpa'))) {
    this.academics.currentCgpa = this.cgpa;
  }
  if (this.backlogs !== undefined && (!this.academics.activeBacklogs || this.isModified('backlogs'))) {
    this.academics.activeBacklogs = this.backlogs;
  }
  if (this.branch && (!this.academics.undergrad?.branch || this.isModified('branch'))) {
    if (!this.academics.undergrad) this.academics.undergrad = {};
    this.academics.undergrad.branch = this.branch;
  }

  // Automatic Invalidation Rule: Any later edit to CGPA/backlogs/branch invalidates verification
  if (!this.isNew && this.isVerifiedByTPO) {
    const academicChanged =
      this.isModified('cgpa') ||
      this.isModified('backlogs') ||
      this.isModified('branch') ||
      this.isModified('rollNo') ||
      this.isModified('academics');

    if (academicChanged) {
      this.isVerifiedByTPO = false;
      if (!this.verificationRecord) {
        this.verificationRecord = {};
      }
      this.verificationRecord.status = 'Needs re-verification';
    }
  }

  next();
});

// Compound unique indexes: roll numbers and profiles are scoped per college!
studentProfileSchema.index({ collegeId: 1, rollNo: 1 }, { unique: true });
studentProfileSchema.index({ collegeId: 1, user: 1 }, { unique: true });
studentProfileSchema.index({ collegeId: 1, branch: 1 });
studentProfileSchema.index({ collegeId: 1, isVerifiedByTPO: 1 });
studentProfileSchema.index({ 'verificationRecord.verificationCode': 1 });

// Apply tenant plugin
studentProfileSchema.plugin(tenantPlugin, { required: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;

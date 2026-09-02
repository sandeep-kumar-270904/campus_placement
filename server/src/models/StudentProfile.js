const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
  degree: { type: String, required: true }, // e.g., B.Tech, 12th, 10th
  institution: { type: String, required: true },
  boardOrUniversity: { type: String, required: true },
  yearOfPassing: { type: Number, required: true },
  score: { type: Number, required: true }, // Percentage or CGPA
  scoreType: { type: String, enum: ['CGPA', 'Percentage'], required: true },
  branch: { type: String } // Only for UG/PG
});

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String }
  },
  academics: {
    tenth: academicSchema,
    twelfth: academicSchema,
    undergrad: academicSchema,
    currentCgpa: { type: Number, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    totalBacklogs: { type: Number, default: 0 },
    graduationYear: { type: Number }
  },
  skills: [{ type: String }],
  projects: [{
    title: { type: String },
    description: { type: String },
    link: { type: String }
  }],
  experience: [{
    company: { type: String },
    role: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  careerGoals: { type: String },
  isVerifiedByTPO: { type: Boolean, default: false }
}, { timestamps: true });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;

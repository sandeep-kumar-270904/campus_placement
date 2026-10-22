const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const tenantPlugin = require('../plugins/tenantPlugin');

const userSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true,
    default: null, // null only for global superadmin
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'tpo', 'coordinator', 'recruiter', 'admin', 'superadmin'],
    default: 'student',
    index: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true,
    default: null,
  },
  companyName: {
    type: String,
    trim: true,
    default: '',
  },
  inviteToken: {
    type: String,
    index: true,
    default: null,
  },
  inviteExpiresAt: {
    type: Date,
    default: null,
  },
  isInvited: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Enforce email uniqueness per college
userSchema.index({ collegeId: 1, email: 1 }, { unique: true });

// Apply tenant scoping plugin (optional for users to allow global superadmin)
userSchema.plugin(tenantPlugin, { required: false });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

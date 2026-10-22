const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');
const { evaluateEligibility } = require('../services/eligibilityEngine');

const eligibilityCacheSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    isEligible: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    reasons: [
      {
        rule: String,
        required: mongoose.Schema.Types.Mixed,
        actual: mongoose.Schema.Types.Mixed,
        gap: mongoose.Schema.Types.Mixed,
        status: String,
        message: String,
      },
    ],
    whatIf: [
      {
        action: String,
        description: String,
        impact: String,
      },
    ],
    summary: String,
    profileUpdatedAt: {
      type: Date,
      required: true,
    },
    opportunityUpdatedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring one cached record per (collegeId, studentId, opportunityId)
eligibilityCacheSchema.index({ collegeId: 1, studentId: 1, opportunityId: 1 }, { unique: true });

eligibilityCacheSchema.statics.getCachedOrCompute = async function (opportunity, studentProfile, college = null) {
  if (!opportunity || !studentProfile) {
    return evaluateEligibility(opportunity, studentProfile, college);
  }

  const collegeId = studentProfile.collegeId || opportunity.collegeId;
  const studentUserId = studentProfile.user?._id || studentProfile.user || studentProfile._id;
  const opportunityId = opportunity._id;

  const profDate = studentProfile.updatedAt || new Date();
  const oppDate = opportunity.updatedAt || new Date();

  // Try cache lookup
  try {
    const cached = await this.findOne({
      collegeId,
      studentId: studentUserId,
      opportunityId,
    }).lean();

    if (
      cached &&
      new Date(cached.profileUpdatedAt).getTime() >= new Date(profDate).getTime() &&
      new Date(cached.opportunityUpdatedAt).getTime() >= new Date(oppDate).getTime()
    ) {
      return {
        isEligible: cached.isEligible,
        eligible: cached.isEligible,
        score: cached.score,
        reasons: cached.reasons,
        whatIf: cached.whatIf,
        summary: cached.summary,
        fromCache: true,
      };
    }
  } catch (err) {
    // Resilient fallback to fresh computation
  }

  // Compute fresh
  const result = evaluateEligibility(opportunity, studentProfile, college);

  // Store in cache asynchronously
  try {
    await this.findOneAndUpdate(
      { collegeId, studentId: studentUserId, opportunityId },
      {
        collegeId,
        studentId: studentUserId,
        opportunityId,
        isEligible: result.isEligible,
        score: result.score,
        reasons: result.reasons,
        whatIf: result.whatIf,
        summary: result.summary,
        profileUpdatedAt: profDate,
        opportunityUpdatedAt: oppDate,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    // Non-fatal cache write failure
  }

  return {
    ...result,
    fromCache: false,
  };
};

eligibilityCacheSchema.statics.invalidateForStudent = async function (studentUserId) {
  return this.deleteMany({ studentId: studentUserId });
};

eligibilityCacheSchema.statics.invalidateForDrive = async function (opportunityId) {
  return this.deleteMany({ opportunityId });
};

eligibilityCacheSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('EligibilityCache', eligibilityCacheSchema);

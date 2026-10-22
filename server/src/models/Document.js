const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const documentSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      index: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['resume', 'marksheet', 'offer_letter', 'noc', 'id_proof'],
      default: 'resume',
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    scanStatus: {
      type: String,
      enum: ['clean', 'flagged', 'pending'],
      default: 'clean',
    },
    scanDetails: {
      type: String,
      default: 'Verified Clean',
    },
  },
  { timestamps: true }
);

// Compound indexes for tenant-scoped document lookup
documentSchema.index({ collegeId: 1, ownerId: 1, purpose: 1 });
documentSchema.index({ collegeId: 1, sha256Hash: 1 });

// Apply tenant plugin
documentSchema.plugin(tenantPlugin, { required: true });

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;

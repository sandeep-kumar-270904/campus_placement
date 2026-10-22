const mongoose = require('mongoose');
const { getTenantContext } = require('../middleware/tenantContext');

/**
 * Mongoose Multi-Tenant Plugin
 * Enforces collegeId scoping automatically on all queries, updates, and inserts.
 */
function tenantPlugin(schema, options = {}) {
  // Add collegeId to the schema if not already present
  if (!schema.path('collegeId')) {
    schema.add({
      collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: options.required !== false,
        index: true,
      },
    });
  }

  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'findOneAndReplace',
    'updateMany',
    'updateOne',
    'deleteMany',
    'deleteOne',
    'countDocuments',
  ];

  queryMethods.forEach((method) => {
    schema.pre(method, function () {
      if (this.getOptions().bypassTenantFilter) {
        return;
      }

      const context = getTenantContext();

      if (context.bypassTenantFilter && !context.collegeId) {
        return;
      }

      if (context.collegeId) {
        // Enforce active tenant filter
        this.where({ collegeId: context.collegeId });
      }
    });
  });

  schema.pre('save', function (next) {
    if (this.isNew || this.isModified('collegeId')) {
      const context = getTenantContext();

      if (context.bypassTenantFilter && !context.collegeId) {
        return next();
      }

      if (context.collegeId) {
        if (!this.collegeId) {
          this.collegeId = context.collegeId;
        } else if (this.collegeId.toString() !== context.collegeId.toString()) {
          const err = new Error('Cross-tenant write rejected: document collegeId does not match authenticated tenant context');
          err.code = 'CROSS_TENANT_WRITE_FORBIDDEN';
          return next(err);
        }
      }
    }
    next();
  });
}

module.exports = tenantPlugin;

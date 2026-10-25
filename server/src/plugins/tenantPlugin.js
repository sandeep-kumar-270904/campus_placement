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

  // Automatically scope aggregation pipelines to active tenant
  schema.pre('aggregate', function () {
    if (this.options && this.options.bypassTenantFilter) {
      return;
    }

    const context = getTenantContext();
    if (context.bypassTenantFilter && !context.collegeId) {
      return;
    }

    if (context.collegeId) {
      const tenantObjectId =
        typeof context.collegeId === 'string' && mongoose.Types.ObjectId.isValid(context.collegeId)
          ? new mongoose.Types.ObjectId(context.collegeId)
          : context.collegeId;

      this.pipeline().unshift({
        $match: { collegeId: tenantObjectId },
      });
    }
  });

  // Query helper for explicit tenant scoping
  schema.query.forTenant = function (collegeId) {
    return this.where({ collegeId });
  };

  schema.pre('save', function (next) {
    if (this.isNew || this.isModified('collegeId')) {
      const context = getTenantContext();

      if (context.bypassTenantFilter && !context.collegeId) {
        if (typeof next === 'function') return next();
        return;
      }

      if (context.collegeId) {
        if (!this.collegeId) {
          this.collegeId = context.collegeId;
        } else if (this.collegeId.toString() !== context.collegeId.toString()) {
          const err = new Error('Cross-tenant write rejected: document collegeId does not match authenticated tenant context');
          err.code = 'CROSS_TENANT_WRITE_FORBIDDEN';
          if (typeof next === 'function') return next(err);
          throw err;
        }
      }
    }
    if (typeof next === 'function') next();
  });
}

module.exports = tenantPlugin;

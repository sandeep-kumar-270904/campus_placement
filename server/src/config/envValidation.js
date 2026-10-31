const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/placeearly'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters for security').default('placeearly_dev_jwt_secret_key_minimum_32_bytes_len!'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters for security').default('placeearly_dev_jwt_refresh_secret_minimum_32_bytes!'),
  ED25519_PRIVATE_KEY: z.string().optional(),
  ED25519_PUBLIC_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().default(100),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  BACKUP_DIR: z.string().default('./backups'),
  BACKUP_RETENTION_DAYS: z.coerce.number().default(14),
});

/**
 * Validates environment configuration at startup.
 * Fails fast and exits with code 1 if required production variables are invalid.
 * In development, applies sensible fallback defaults.
 */
function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('\x1b[31m%s\x1b[0m', '════════════════════════════════════════════════════════════════');
    console.error('\x1b[31m%s\x1b[0m', '  ❌ FATAL ENVIRONMENT CONFIGURATION ERROR:');
    console.error('\x1b[31m%s\x1b[0m', '  Startup aborted due to invalid or missing environment variables.');
    console.error('\x1b[31m%s\x1b[0m', '════════════════════════════════════════════════════════════════');

    const formattedErrors = result.error.format();
    for (const [key, value] of Object.entries(formattedErrors)) {
      if (key !== '_errors' && value?._errors?.length) {
        console.error(`  - ${key}: ${value._errors.join(', ')}`);
      }
    }

    if (env.NODE_ENV === 'production') {
      console.error('\x1b[31m%s\x1b[0m', '  Exiting process due to production security mandate.\n');
      process.exit(1);
    } else {
      console.warn('\x1b[33m%s\x1b[0m', '  [DEV WARNING] Continuing with default fallbacks in non-production environment.\n');
    }
    return null;
  }

  // Production security checks
  if (result.data.NODE_ENV === 'production') {
    const isDefaultJwt = result.data.JWT_SECRET.includes('dev_jwt');
    const isDefaultRefresh = result.data.JWT_REFRESH_SECRET.includes('dev_jwt');

    if (isDefaultJwt || isDefaultRefresh) {
      console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL: Default dev JWT secrets detected in PRODUCTION environment.');
      console.error('Please configure strong random secrets for JWT_SECRET and JWT_REFRESH_SECRET in your production .env.');
      process.exit(1);
    }
  }

  return result.data;
}

module.exports = {
  validateEnv,
  envSchema,
};

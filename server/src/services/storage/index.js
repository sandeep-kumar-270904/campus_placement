const S3StorageProvider = require('./S3StorageProvider');
const LocalStorageProvider = require('./LocalStorageProvider');

let currentStorageService = null;

/**
 * Get active storage provider singleton
 * @returns {import('./IStorageService')}
 */
function getStorageService() {
  if (currentStorageService) {
    return currentStorageService;
  }

  const hasS3Config =
    (process.env.S3_BUCKET || process.env.R2_BUCKET_NAME) &&
    (process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID);

  const providerType = process.env.STORAGE_PROVIDER || (hasS3Config ? 's3' : 'local');

  if (providerType === 's3' || providerType === 'r2') {
    currentStorageService = new S3StorageProvider();
  } else {
    currentStorageService = new LocalStorageProvider();
  }

  return currentStorageService;
}

/**
 * Override storage provider (useful for testing or switching adapters)
 * @param {import('./IStorageService')} provider
 */
function setStorageService(provider) {
  currentStorageService = provider;
}

module.exports = {
  getStorageService,
  setStorageService,
  S3StorageProvider,
  LocalStorageProvider,
};

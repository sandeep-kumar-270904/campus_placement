/**
 * Abstract Storage Service Interface
 * All storage providers (S3, Cloudflare R2, Local Dev Provider) must implement these methods.
 */
class IStorageService {
  /**
   * Uploads a file buffer to private object storage
   * @param {{ key: string, buffer: Buffer, contentType: string, metadata?: object }} options
   * @returns {Promise<{ key: string, size: number, eTag?: string }>}
   */
  async upload(options) {
    throw new Error('Method upload() must be implemented');
  }

  /**
   * Generates a time-limited signed URL for private asset access
   * @param {{ key: string, expiresInSeconds?: number, filename?: string }} options
   * @returns {Promise<{ url: string, expiresAt: Date }>}
   */
  async getSignedDownloadUrl(options) {
    throw new Error('Method getSignedDownloadUrl() must be implemented');
  }

  /**
   * Deletes an object by key
   * @param {{ key: string }} options
   * @returns {Promise<boolean>}
   */
  async delete(options) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Checks if an object exists in storage
   * @param {{ key: string }} options
   * @returns {Promise<boolean>}
   */
  async exists(options) {
    throw new Error('Method exists() must be implemented');
  }
}

module.exports = IStorageService;

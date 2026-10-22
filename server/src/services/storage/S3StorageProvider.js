const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const IStorageService = require('./IStorageService');

class S3StorageProvider extends IStorageService {
  /**
   * @param {{
   *   bucket: string,
   *   region?: string,
   *   endpoint?: string,
   *   accessKeyId: string,
   *   secretAccessKey: string,
   * }} config
   */
  constructor(config = {}) {
    super();
    this.bucket = config.bucket || process.env.S3_BUCKET || process.env.R2_BUCKET_NAME || 'placeearly-private-docs';
    this.region = config.region || process.env.S3_REGION || process.env.AWS_REGION || 'auto';

    let endpoint = config.endpoint || process.env.S3_ENDPOINT;
    if (!endpoint && process.env.R2_ACCOUNT_ID) {
      endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    }

    const credentials = {
      accessKeyId: config.accessKeyId || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: config.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    };

    const clientConfig = {
      region: this.region,
      credentials,
    };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    this.client = new S3Client(clientConfig);
  }

  async upload({ key, buffer, contentType, metadata = {} }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    const res = await this.client.send(command);
    return {
      key,
      size: buffer.length,
      eTag: res.ETag,
    };
  }

  async getSignedDownloadUrl({ key, expiresInSeconds = 300, filename }) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    if (filename) {
      params.ResponseContentDisposition = `attachment; filename="${encodeURIComponent(filename)}"`;
    }

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      url,
      expiresAt,
    };
  }

  async delete({ key }) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
    return true;
  }

  async exists({ key }) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }
}

module.exports = S3StorageProvider;

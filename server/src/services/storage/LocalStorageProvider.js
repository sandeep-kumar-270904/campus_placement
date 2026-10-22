const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const IStorageService = require('./IStorageService');

class LocalStorageProvider extends IStorageService {
  constructor(config = {}) {
    super();
    this.baseDir = config.baseDir || path.join(__dirname, '../../../storage/private_vault');
    this.secret = config.secret || process.env.STORAGE_SIGNING_SECRET || process.env.JWT_SECRET || 'dev_private_vault_secret_2026';
    this.baseUrl = config.baseUrl || process.env.VITE_API_URL || '/api';

    // Ensure base private directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  _getDiskPath(key) {
    // Sanitize key to prevent path traversal
    const safeKey = key.replace(/(\.\.[\/\\])+/g, '').replace(/^[\\\/]+/, '');
    return path.join(this.baseDir, safeKey);
  }

  async upload({ key, buffer, contentType, metadata = {} }) {
    const diskPath = this._getDiskPath(key);
    const parentDir = path.dirname(diskPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await fs.promises.writeFile(diskPath, buffer);

    // Save metadata sidecar
    const metaPath = diskPath + '.meta.json';
    const metaData = {
      contentType,
      size: buffer.length,
      uploadedAt: new Date().toISOString(),
      metadata,
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metaData, null, 2));

    return {
      key,
      size: buffer.length,
    };
  }

  async getSignedDownloadUrl({ key, expiresInSeconds = 300, filename }) {
    const expiresTimestamp = Date.now() + expiresInSeconds * 1000;
    const dataToSign = `${key}:${expiresTimestamp}`;
    const token = crypto.createHmac('sha256', this.secret).update(dataToSign).digest('hex');

    const encodedKey = encodeURIComponent(key);
    let url = `${this.baseUrl}/documents/raw/${encodedKey}?token=${token}&expires=${expiresTimestamp}`;
    if (filename) {
      url += `&filename=${encodeURIComponent(filename)}`;
    }

    return {
      url,
      expiresAt: new Date(expiresTimestamp),
    };
  }

  verifySignature(key, token, expiresTimestamp) {
    if (!token || !expiresTimestamp) return false;
    const exp = parseInt(expiresTimestamp, 10);
    if (isNaN(exp) || Date.now() > exp) {
      return false; // Expired
    }

    const dataToSign = `${key}:${exp}`;
    const expectedToken = crypto.createHmac('sha256', this.secret).update(dataToSign).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expectedToken, 'hex'));
    } catch {
      return false;
    }
  }

  async delete({ key }) {
    const diskPath = this._getDiskPath(key);
    try {
      if (fs.existsSync(diskPath)) {
        await fs.promises.unlink(diskPath);
      }
      const metaPath = diskPath + '.meta.json';
      if (fs.existsSync(metaPath)) {
        await fs.promises.unlink(metaPath);
      }
      return true;
    } catch {
      return false;
    }
  }

  async exists({ key }) {
    const diskPath = this._getDiskPath(key);
    return fs.existsSync(diskPath);
  }

  async getFileBuffer(key) {
    const diskPath = this._getDiskPath(key);
    if (!fs.existsSync(diskPath)) {
      throw new Error(`File not found: ${key}`);
    }
    const buffer = await fs.promises.readFile(diskPath);
    let meta = { contentType: 'application/octet-stream' };
    const metaPath = diskPath + '.meta.json';
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf8'));
      } catch {}
    }

    return {
      buffer,
      contentType: meta.contentType || 'application/octet-stream',
    };
  }
}

module.exports = LocalStorageProvider;

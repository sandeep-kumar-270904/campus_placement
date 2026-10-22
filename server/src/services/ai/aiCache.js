const crypto = require('crypto');

class AiCache {
  constructor(defaultTtlMs = 24 * 60 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  generateKey(prefix, ...parts) {
    const combined = parts.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join(':');
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    return `${prefix}:${hash}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      savedAt: new Date(),
    });
    return value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const aiCacheInstance = new AiCache();
module.exports = aiCacheInstance;

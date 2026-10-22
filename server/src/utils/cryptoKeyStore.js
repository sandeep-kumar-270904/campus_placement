const crypto = require('crypto');

/**
 * Keystore with zero-downtime key rotation support for Ed25519 digital signatures
 */
class CryptoKeyStore {
  constructor() {
    this.keyPairs = new Map();
    this.activeKeyId = process.env.ED25519_ACTIVE_KEY_ID || 'pe-ed25519-v1';

    // Initialize initial default/persistent key pair
    this._initializeDefaultKeys();
  }

  _initializeDefaultKeys() {
    // If environment variables provide Ed25519 PEM keys, load them
    if (process.env.ED25519_PRIVATE_KEY && process.env.ED25519_PUBLIC_KEY) {
      this.registerKey({
        keyId: this.activeKeyId,
        privateKey: process.env.ED25519_PRIVATE_KEY,
        publicKey: process.env.ED25519_PUBLIC_KEY,
      });
      return;
    }

    // In development/test mode or if unconfigured, generate a persistent deterministic or valid Ed25519 keypair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.registerKey({
      keyId: this.activeKeyId,
      privateKey,
      publicKey,
    });
  }

  /**
   * Register a keypair under a specific keyId for rotation
   * @param {{ keyId: string, privateKey?: string|crypto.KeyObject, publicKey: string|crypto.KeyObject }} param0
   */
  registerKey({ keyId, privateKey, publicKey }) {
    if (!keyId || !publicKey) {
      throw new Error('registerKey requires keyId and publicKey');
    }
    this.keyPairs.set(keyId, {
      keyId,
      privateKey: privateKey || null,
      publicKey,
      registeredAt: new Date(),
    });
  }

  /**
   * Set a registered key as the new active signing key
   * @param {string} keyId
   */
  setActiveKey(keyId) {
    if (!this.keyPairs.has(keyId)) {
      throw new Error(`Cannot set unknown keyId '${keyId}' as active key`);
    }
    const pair = this.keyPairs.get(keyId);
    if (!pair.privateKey) {
      throw new Error(`Key '${keyId}' has no private key and cannot be used for signing`);
    }
    this.activeKeyId = keyId;
  }

  /**
   * Rotate to a brand new Ed25519 keypair
   * @param {string} newKeyId
   * @returns {{ keyId: string, publicKey: string }}
   */
  rotateToNewKey(newKeyId) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.registerKey({
      keyId: newKeyId,
      privateKey,
      publicKey,
    });

    this.setActiveKey(newKeyId);

    return {
      keyId: newKeyId,
      publicKey,
    };
  }

  /**
   * Get the active private key and keyId for signing
   * @returns {{ keyId: string, privateKey: string|crypto.KeyObject }}
   */
  getActiveSigningKey() {
    const pair = this.keyPairs.get(this.activeKeyId);
    if (!pair || !pair.privateKey) {
      throw new Error(`No active signing key configured for keyId '${this.activeKeyId}'`);
    }
    return {
      keyId: this.activeKeyId,
      privateKey: pair.privateKey,
    };
  }

  /**
   * Get public key by keyId for verification
   * @param {string} keyId
   * @returns {string|crypto.KeyObject|null}
   */
  getPublicKey(keyId) {
    const pair = this.keyPairs.get(keyId);
    return pair ? pair.publicKey : null;
  }

  /**
   * List all registered key IDs
   */
  listKeys() {
    return Array.from(this.keyPairs.values()).map((p) => ({
      keyId: p.keyId,
      isActive: p.keyId === this.activeKeyId,
      hasPrivateKey: Boolean(p.privateKey),
    }));
  }
}

// Export singleton instance
const keyStore = new CryptoKeyStore();

module.exports = {
  CryptoKeyStore,
  keyStore,
};

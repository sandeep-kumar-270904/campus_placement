const crypto = require('crypto');
const { keyStore } = require('./cryptoKeyStore');

/**
 * Deterministically serialize academic data into canonical JSON
 * Sorts keys alphabetically and normalizes number/date formats
 */
function createCanonicalJson(data) {
  const canonicalObj = {
    backlogs: Number(data.backlogs ?? 0),
    branch: (data.branch || '').trim(),
    cgpa: Number(data.cgpa ?? 0).toFixed(2),
    collegeId: data.collegeId ? data.collegeId.toString() : '',
    gradYear: Number(data.gradYear ?? data.graduationYear ?? 2026),
    rollNo: (data.rollNo || '').trim().toUpperCase(),
    studentId: data.studentId ? data.studentId.toString() : '',
    verifiedAt: new Date(data.verifiedAt).toISOString(),
    verifiedByTpoId: data.verifiedByTpoId ? data.verifiedByTpoId.toString() : '',
  };

  // Sort keys strictly
  const sortedKeys = Object.keys(canonicalObj).sort();
  const sortedMap = {};
  for (const k of sortedKeys) {
    sortedMap[k] = canonicalObj[k];
  }

  return JSON.stringify(sortedMap);
}

/**
 * Computes SHA-256 hash of a string or buffer
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a cryptographically signed Ed25519 TPO Verified Seal
 * @param {{
 *   collegeId: string,
 *   studentId: string,
 *   rollNo: string,
 *   branch: string,
 *   gradYear: number,
 *   cgpa: number,
 *   backlogs: number,
 *   verifiedByTpoId: string,
 *   verifiedAt?: Date,
 * }} data
 */
function generateVerificationSeal(data) {
  const verifiedAt = data.verifiedAt || new Date();
  const canonicalString = createCanonicalJson({
    ...data,
    verifiedAt,
  });

  const hash = sha256(canonicalString);
  const { keyId, privateKey } = keyStore.getActiveSigningKey();

  // Ed25519 signature over hash
  const signatureBuffer = crypto.sign(null, Buffer.from(hash, 'utf8'), privateKey);
  const signature = signatureBuffer.toString('base64');

  // Unique verification code for public lookup (e.g. PE-ANITS-8F92B7A1-2026)
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const collegeCode = (data.collegeCode || 'COL').toUpperCase();
  const verificationCode = `PE-${collegeCode}-${randomSuffix}-${data.gradYear || 2026}`;

  return {
    status: 'Verified',
    verificationCode,
    hash,
    signature,
    keyId,
    version: 1,
    verifiedAt,
    verifiedBy: data.verifiedByTpoId,
    canonicalData: JSON.parse(canonicalString),
  };
}

/**
 * Verify an academic verification record against the current database data and Ed25519 signature
 * @param {{
 *   currentData: {
 *     collegeId: string,
 *     studentId: string,
 *     rollNo: string,
 *     branch: string,
 *     gradYear: number,
 *     cgpa: number,
 *     backlogs: number,
 *   },
 *   verificationRecord: {
 *     hash: string,
 *     signature: string,
 *     keyId: string,
 *     version: number,
 *     verifiedAt: Date,
 *     verifiedBy: string,
 *     status: string,
 *   }
 * }} param0
 * @returns {{ isValid: boolean, reason?: string, currentHash: string, storedHash: string }}
 */
function verifyVerificationSeal({ currentData, verificationRecord }) {
  if (!verificationRecord || !verificationRecord.hash || !verificationRecord.signature) {
    return {
      isValid: false,
      reason: 'No digital verification seal present on student record',
    };
  }

  // 1. Recreate canonical string using the CURRENT database fields
  // with the original verifiedAt and verifiedBy from the seal
  const currentCanonical = createCanonicalJson({
    ...currentData,
    verifiedAt: verificationRecord.verifiedAt,
    verifiedByTpoId: verificationRecord.verifiedBy,
  });

  const currentHash = sha256(currentCanonical);
  const storedHash = verificationRecord.hash;

  // 2. Tamper Check: Check if current data hash matches the signed hash
  if (currentHash !== storedHash) {
    return {
      isValid: false,
      reason: 'Record changed or invalid: Current academic record does not match the digitally signed seal (tamper detected)',
      currentHash,
      storedHash,
    };
  }

  // 3. Key Lookup from Keystore
  const publicKey = keyStore.getPublicKey(verificationRecord.keyId);
  if (!publicKey) {
    return {
      isValid: false,
      reason: `Unknown signature keyId '${verificationRecord.keyId}'. Key may have been purged from keystore.`,
      currentHash,
      storedHash,
    };
  }

  // 4. Ed25519 Cryptographic Signature Verification
  let signatureValid = false;
  try {
    signatureValid = crypto.verify(
      null,
      Buffer.from(storedHash, 'utf8'),
      publicKey,
      Buffer.from(verificationRecord.signature, 'base64')
    );
  } catch (err) {
    return {
      isValid: false,
      reason: `Cryptographic signature check failed: ${err.message}`,
      currentHash,
      storedHash,
    };
  }

  if (!signatureValid) {
    return {
      isValid: false,
      reason: 'Record changed or invalid: Cryptographic Ed25519 signature is invalid',
      currentHash,
      storedHash,
    };
  }

  return {
    isValid: true,
    status: 'Signature valid',
    currentHash,
    storedHash,
  };
}

module.exports = {
  createCanonicalJson,
  sha256,
  generateVerificationSeal,
  verifyVerificationSeal,
};

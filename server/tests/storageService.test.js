const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const fs = require('fs');
const mongoose = require('mongoose');

const { LocalStorageProvider, getStorageService, setStorageService } = require('../src/services/storage');
const Document = require('../src/models/Document');
const { getSignedUrlForDocument } = require('../src/controllers/documentController');

describe('Storage Service & Signed URL Tests (Part A)', () => {
  const tempStorageDir = path.join(os.tmpdir(), 'placeearly-test-vault-' + Date.now());
  const provider = new LocalStorageProvider({
    baseDir: tempStorageDir,
    secret: 'test-secret-storage-key-2026',
    baseUrl: '/api',
  });

  // Register this provider for the tests
  setStorageService(provider);

  const testKey = 'tenants/col-1/resumes/test-resume.pdf';
  const testBuffer = Buffer.from('%PDF-1.7 Authentic Test PDF Stream');

  test('LocalStorageProvider uploads buffer to private disk vault and checks existence', async () => {
    const uploadRes = await provider.upload({
      key: testKey,
      buffer: testBuffer,
      contentType: 'application/pdf',
      metadata: { owner: 'student-123' },
    });

    assert.strictEqual(uploadRes.key, testKey);
    assert.strictEqual(uploadRes.size, testBuffer.length);

    const exists = await provider.exists({ key: testKey });
    assert.strictEqual(exists, true);
  });

  test('LocalStorageProvider generates signed URL with 5-minute expiry and valid HMAC token', async () => {
    const signed = await provider.getSignedDownloadUrl({
      key: testKey,
      expiresInSeconds: 300, // 5 minutes
      filename: 'my_resume.pdf',
    });

    assert.ok(signed.url.includes('/api/documents/raw/'));
    assert.ok(signed.url.includes('token='));
    assert.ok(signed.url.includes('expires='));

    // Check expiry is ~5 minutes ahead
    const diffSeconds = (signed.expiresAt.getTime() - Date.now()) / 1000;
    assert.ok(diffSeconds >= 290 && diffSeconds <= 305, 'Signed URL must expire in ~300 seconds');

    // Extract query params and verify
    const urlObj = new URL(signed.url, 'http://localhost:5000');
    const token = urlObj.searchParams.get('token');
    const expires = urlObj.searchParams.get('expires');

    const isValid = provider.verifySignature(testKey, token, expires);
    assert.strictEqual(isValid, true, 'HMAC signature should verify successfully for active window');
  });

  test('LocalStorageProvider rejects expired or tampered signed URL tokens', () => {
    // 1. Expired timestamp (10 seconds in the past)
    const pastExpires = Date.now() - 10000;
    const expiredValidToken = require('crypto')
      .createHmac('sha256', provider.secret)
      .update(`${testKey}:${pastExpires}`)
      .digest('hex');

    const isExpiredValid = provider.verifySignature(testKey, expiredValidToken, pastExpires);
    assert.strictEqual(isExpiredValid, false, 'Expired URL token must be rejected');

    // 2. Tampered token
    const futureExpires = Date.now() + 300000;
    const fakeToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const isTamperedValid = provider.verifySignature(testKey, fakeToken, futureExpires);
    assert.strictEqual(isTamperedValid, false, 'Tampered token must be rejected');

    // 3. Tampered key in URL
    const originalToken = require('crypto')
      .createHmac('sha256', provider.secret)
      .update(`${testKey}:${futureExpires}`)
      .digest('hex');
    const isWrongKeyValid = provider.verifySignature('tenants/col-2/victim.pdf', originalToken, futureExpires);
    assert.strictEqual(isWrongKeyValid, false, 'URL signed for one key cannot access another key');
  });

  test('Per-role access checks: Student A cannot get signed URL for Student B document', async () => {
    const studentAId = new mongoose.Types.ObjectId().toString();
    const studentBId = new mongoose.Types.ObjectId().toString();
    const collegeId = new mongoose.Types.ObjectId().toString();

    // Mock document record
    const mockDoc = {
      _id: 'doc-456',
      ownerId: new mongoose.Types.ObjectId(studentBId),
      collegeId: new mongoose.Types.ObjectId(collegeId),
      storageKey: testKey,
      originalName: 'secret.pdf',
    };

    // Temporarily stub Document.findById
    const origFindById = Document.findById;
    Document.findById = () => Promise.resolve(mockDoc);

    try {
      const req = {
        params: { id: 'doc-456' },
        user: {
          userId: studentAId,
          role: 'student',
          collegeId,
        },
        tenant: { collegeId },
      };

      let statusCode = null;
      let jsonPayload = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      await getSignedUrlForDocument(req, res);

      assert.strictEqual(statusCode, 403, 'Should reject Student A requesting Student B document with 403');
      assert.strictEqual(jsonPayload?.error?.code, 'FORBIDDEN');
    } finally {
      Document.findById = origFindById;
    }
  });

  test('Per-role access checks: TPO can get signed URL for student within their college', async () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const tpoId = new mongoose.Types.ObjectId().toString();
    const collegeId = new mongoose.Types.ObjectId().toString();

    const mockDoc = {
      _id: 'doc-789',
      ownerId: new mongoose.Types.ObjectId(studentId),
      collegeId: new mongoose.Types.ObjectId(collegeId),
      storageKey: testKey,
      originalName: 'marksheet.pdf',
    };

    const origFindById = Document.findById;
    Document.findById = () => Promise.resolve(mockDoc);

    try {
      const req = {
        params: { id: 'doc-789' },
        user: {
          userId: tpoId,
          role: 'tpo',
          collegeId,
        },
        tenant: { collegeId },
      };

      let jsonPayload = null;
      const res = {
        json: (data) => {
          jsonPayload = data;
        },
      };

      await getSignedUrlForDocument(req, res);

      assert.ok(jsonPayload?.url, 'TPO must receive signed download URL');
      assert.strictEqual(jsonPayload.expiresInSeconds, 300);
    } finally {
      Document.findById = origFindById;
    }
  });
});

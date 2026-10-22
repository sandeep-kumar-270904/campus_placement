const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  validateUploadedFile,
  detectFileTypeFromMagicBytes,
  MAX_FILE_SIZE_BYTES,
} = require('../src/utils/fileValidator');

describe('File Security & Magic-Byte Validation Tests (Part A)', () => {
  // Synthetic authentic file buffers
  const validPdfBuffer = Buffer.from('%PDF-1.7\n%Fake PDF binary stream payload for testing');
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00, 0x08, 0x00]);

  test('detectFileTypeFromMagicBytes correctly identifies PDF, PNG, JPG, and DOCX', () => {
    assert.strictEqual(detectFileTypeFromMagicBytes(validPdfBuffer)?.type, 'pdf');
    assert.strictEqual(detectFileTypeFromMagicBytes(validPngBuffer)?.type, 'png');
    assert.strictEqual(detectFileTypeFromMagicBytes(validJpgBuffer)?.type, 'jpeg');
    assert.strictEqual(detectFileTypeFromMagicBytes(validDocxBuffer)?.type, 'docx');
  });

  test('validateUploadedFile accepts authentic PDF within 5MB limit', async () => {
    const res = await validateUploadedFile({
      buffer: validPdfBuffer,
      size: validPdfBuffer.length,
      originalname: 'resume_2026.pdf',
    });

    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.fileType.type, 'pdf');
    assert.ok(res.hash && res.hash.length === 64, 'Must compute SHA-256 hash');
    assert.strictEqual(res.scanResult.isClean, true);
  });

  test('validateUploadedFile rejects spoofed extension (e.g. plain text or executable renamed to .pdf)', async () => {
    const fakeTextDisguisedAsPdf = Buffer.from('This is a plain text file pretending to be a PDF.');
    const res = await validateUploadedFile({
      buffer: fakeTextDisguisedAsPdf,
      size: fakeTextDisguisedAsPdf.length,
      originalname: 'malicious.pdf',
    });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('magic-byte validation failed'));
  });

  test('validateUploadedFile rejects authentic PDF renamed with wrong extension', async () => {
    const res = await validateUploadedFile({
      buffer: validPdfBuffer,
      size: validPdfBuffer.length,
      originalname: 'document.png',
    });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('File extension mismatch'));
  });

  test('validateUploadedFile rejects files exceeding the 5 MB threshold', async () => {
    // Buffer 5MB + 1KB
    const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
    // Write PDF header so magic-bytes would pass
    oversizedBuffer.write('%PDF-', 0, 'ascii');

    const res = await validateUploadedFile({
      buffer: oversizedBuffer,
      size: oversizedBuffer.length,
      originalname: 'huge_portfolio.pdf',
    });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('exceeds maximum allowed limit of 5 MB'));
  });

  test('validateUploadedFile accepts authentic DOCX, PNG, and JPEG formats', async () => {
    const pngRes = await validateUploadedFile({
      buffer: validPngBuffer,
      size: validPngBuffer.length,
      originalname: 'id_badge.png',
    });
    assert.strictEqual(pngRes.isValid, true);

    const jpgRes = await validateUploadedFile({
      buffer: validJpgBuffer,
      size: validJpgBuffer.length,
      originalname: 'marksheet.jpg',
    });
    assert.strictEqual(jpgRes.isValid, true);

    const docxRes = await validateUploadedFile({
      buffer: validDocxBuffer,
      size: validDocxBuffer.length,
      originalname: 'cover_letter.docx',
    });
    assert.strictEqual(docxRes.isValid, true);
  });
});

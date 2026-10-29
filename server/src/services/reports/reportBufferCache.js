/**
 * In-memory buffer cache for generated report files.
 * Provides quick streaming downloads by jobId with 1-hour TTL.
 */

const bufferCache = new Map();

function storeReportBuffer(jobId, { buffer, contentType, fileName }) {
  bufferCache.set(jobId, {
    buffer,
    contentType,
    fileName,
    createdAt: Date.now(),
  });

  // Automatically sweep entries older than 2 hours
  if (bufferCache.size > 100) {
    const twoHoursAgo = Date.now() - 2 * 3600 * 1000;
    for (const [id, item] of bufferCache.entries()) {
      if (item.createdAt < twoHoursAgo) {
        bufferCache.delete(id);
      }
    }
  }
}

function getReportBuffer(jobId) {
  return bufferCache.get(jobId);
}

function clearReportBufferCache() {
  bufferCache.clear();
}

module.exports = {
  storeReportBuffer,
  getReportBuffer,
  clearReportBufferCache,
};


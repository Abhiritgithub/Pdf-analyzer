const dotenv = require('dotenv');

dotenv.config();

const toNumber = (value, fallback) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

module.exports = {
  port: toNumber(process.env.PORT || process.env.BACKEND_PORT, 5000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiTimeoutMs: toNumber(process.env.GEMINI_TIMEOUT_MS, 120000),
  pdfDownloadTimeoutMs: toNumber(process.env.PDF_DOWNLOAD_TIMEOUT_MS, 15000),
  maxPdfSizeBytes: toNumber(process.env.PDF_MAX_SIZE_BYTES, 15 * 1024 * 1024)
};

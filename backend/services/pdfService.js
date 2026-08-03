const axios = require('axios');
const pdfParse = require('pdf-parse');

const { maxPdfSizeBytes, pdfDownloadTimeoutMs } = require('../config/env');
const { HttpError } = require('../utils/httpError');
const { ensurePublicHttpUrl } = require('../utils/publicUrl');

function isPdfPayload(buffer, contentType) {
  const signature = buffer.subarray(0, 4).toString('utf8');
  return contentType.includes('pdf') || signature === '%PDF';
}

async function downloadPdfBuffer(pdfUrl) {
  const safeUrl = await ensurePublicHttpUrl(pdfUrl);

  try {
    const response = await axios.get(safeUrl, {
      responseType: 'arraybuffer',
      timeout: pdfDownloadTimeoutMs,
      maxContentLength: maxPdfSizeBytes,
      maxBodyLength: maxPdfSizeBytes,
      headers: {
        Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
        'User-Agent': 'PDF-Analyzer/1.0'
      }
    });

    const buffer = Buffer.from(response.data);
    const contentType = String(response.headers['content-type'] || '').toLowerCase();

    if (!buffer.length) {
      throw new HttpError(422, 'The PDF download was empty.');
    }

    if (!isPdfPayload(buffer, contentType)) {
      throw new HttpError(422, 'The URL did not return a valid PDF document.');
    }

    return buffer;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error.code === 'ECONNABORTED') {
      throw new HttpError(504, 'The PDF download timed out.');
    }

    if (error.code === 'ERR_BAD_RESPONSE' || String(error.message || '').includes('maxContentLength size of')) {
      throw new HttpError(413, 'The PDF is too large to process.');
    }

    if (error.response) {
      const { status } = error.response;

      if (status === 404) {
        throw new HttpError(404, 'PDF not found at the provided URL.');
      }

      if (status === 403) {
        throw new HttpError(403, 'The PDF cannot be downloaded from this URL.');
      }

      throw new HttpError(status >= 400 && status < 500 ? status : 502, 'The PDF could not be downloaded.');
    }

    throw new HttpError(502, 'The PDF could not be downloaded due to a network error.');
  }
}

async function extractTextFromPdfBuffer(pdfBuffer) {
  try {
    const parsedPdf = await pdfParse(pdfBuffer);
    const extractedText = String(parsedPdf.text || '').replace(/\s+/g, ' ').trim();

    return {
      text: extractedText,
      pageCount: parsedPdf.numpages || 0,
      info: parsedPdf.info || {}
    };
  } catch (error) {
    throw new HttpError(422, 'The PDF could not be processed.');
  }
}

module.exports = {
  downloadPdfBuffer,
  extractTextFromPdfBuffer
};

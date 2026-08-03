const { HttpError } = require('../utils/httpError');
const { downloadPdfBuffer, extractTextFromPdfBuffer } = require('../services/pdfService');
const { analyzePdfText } = require('../services/geminiService');

async function analyzePdf(req, res, next) {
  try {
    const inputUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

    if (!inputUrl) {
      throw new HttpError(400, 'Please provide a PDF URL.');
    }

    if (!/^https?:\/\//i.test(inputUrl)) {
      throw new HttpError(400, 'Only http:// and https:// URLs are allowed.');
    }

    const pdfBuffer = await downloadPdfBuffer(inputUrl);
    const extractedPdf = await extractTextFromPdfBuffer(pdfBuffer);

    if (!extractedPdf.text) {
      throw new HttpError(422, 'No text could be extracted from the PDF.');
    }

    const analysis = await analyzePdfText(extractedPdf.text);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzePdf
};

const axios = require('axios');

const { geminiApiKey, geminiModel, geminiTimeoutMs } = require('../config/env');
const { HttpError } = require('../utils/httpError');

function buildPrompt(documentText) {
  return [
    'You are a document analysis engine.',
    'Analyze the provided PDF text and return STRICT JSON only.',
    'Do not add markdown, code fences, commentary, or extra keys.',
    'If a field is unknown, use an empty string or empty array as appropriate.',
    '',
    'Required JSON shape:',
    '{',
    '  "documentType": "",',
    '  "title": "",',
    '  "authors": [],',
    '  "summary": "",',
    '  "keyTakeaway": ""',
    '}',
    '',
    'PDF text to analyze:',
    documentText.slice(0, 50000)
  ].join('\n');
}

function stripCodeFences(value) {
  return value.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function normalizeAnalysisPayload(payload) {
  const authors = Array.isArray(payload.authors)
    ? payload.authors.filter((author) => typeof author === 'string' && author.trim()).map((author) => author.trim())
    : [];

  return {
    documentType: typeof payload.documentType === 'string' ? payload.documentType.trim() : '',
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    authors,
    summary: typeof payload.summary === 'string' ? payload.summary.trim() : '',
    keyTakeaway: typeof payload.keyTakeaway === 'string' ? payload.keyTakeaway.trim() : ''
  };
}

async function analyzePdfText(documentText) {
  if (!geminiApiKey) {
    throw new HttpError(503, 'The Gemini API key is not configured on the server. Add GEMINI_API_KEY to your backend .env file.');
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(documentText) }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      },
      {
        timeout: geminiTimeoutMs,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const candidate = response.data?.candidates?.[0];
    const responseText = candidate?.content?.parts?.map((part) => part.text || '').join('') || '';

    if (!responseText.trim()) {
      throw new HttpError(502, 'Gemini did not return an analysis.');
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(stripCodeFences(responseText));
    } catch {
      throw new HttpError(502, 'Gemini returned invalid JSON.');
    }

    return normalizeAnalysisPayload(parsedResponse);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    if (error.code === 'ECONNABORTED') {
      throw new HttpError(504, 'Gemini timed out while generating the analysis.');
    }

    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message;

    if (status === 400) {
      throw new HttpError(502, apiMessage || 'Gemini rejected the analysis request.');
    }

    if (status === 401 || status === 403) {
      throw new HttpError(502, apiMessage || 'Gemini API authentication failed. Check the API key and project access.');
    }

    if (status === 429) {
      throw new HttpError(503, apiMessage || 'Gemini rate limit reached or quota is exhausted. Please try again shortly.');
    }

    throw new HttpError(502, apiMessage || 'Gemini API error while generating the analysis.');
  }
}

module.exports = {
  analyzePdfText
};

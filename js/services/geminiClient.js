/**
 * Gemini REST Client — Production Integration
 * Uses X-goog-api-key header authentication with gemini-3.8-flash model
 * Supports timeout, retry with exponential backoff, model fallback chain,
 * error handling, and JSON response mode
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Ordered fallback chain — gemini-flash-lite-latest has active quota, followed by flash-latest */
const MODEL_FALLBACK_CHAIN = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash'
];

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 800;

/**
 * Single attempt to call a specific Gemini model
 * @private
 */
async function _callModel(apiKey, model, requestBody, timeoutMs) {
  const cleanKey = apiKey.trim();
  // Support both URL param and X-goog-api-key header for maximum browser/network compatibility
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': cleanKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Gemini API returned status ${response.status}`;
      let statusCode = response.status;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMsg = errorData.error.message;
        }
      } catch { /* use default */ }
      const err = new Error(errorMsg);
      err.statusCode = statusCode;
      throw err;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty or invalid response.');
    }

    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const e = new Error(`Request to Gemini model ${model} timed out.`);
      e.statusCode = 408;
      throw e;
    }
    throw err;
  }
}

/**
 * Call Google Gemini with structured prompt via header-based auth.
 * Automatically retries on 503 (overloaded) with exponential backoff
 * and falls back through the model chain on 404 (deprecated model).
 *
 * @param {string} apiKey 
 * @param {string} prompt 
 * @param {object} [options]
 * @returns {Promise<string>}
 */
export async function callGemini(apiKey, prompt, options = {}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Gemini API key is required to call external GenAI.');
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      maxOutputTokens: options.maxTokens || 4096,
      responseMimeType: options.jsonMode ? 'application/json' : 'text/plain'
    }
  };

  const timeoutMs = options.timeoutMs || 45000;

  // Build model list: user-specified model first, then fallback chain
  const models = options.model
    ? [options.model, ...MODEL_FALLBACK_CHAIN.filter(m => m !== options.model)]
    : [...MODEL_FALLBACK_CHAIN];

  let lastError = null;

  for (const model of models) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await _callModel(apiKey, model, requestBody, timeoutMs);
      } catch (err) {
        lastError = err;
        // 404 = model not found / deprecated → skip to next model immediately
        if (err.statusCode === 404) break;
        // 429 Quota exhausted for this model → skip to next model in fallback chain immediately
        if (err.statusCode === 429 && (err.message?.toLowerCase().includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED'))) {
          console.warn(`[GeminiClient] Model ${model} daily free quota exceeded. Falling over to next model in chain...`);
          break;
        }
        // 503 / transient 429 rate limit → retry with exponential backoff
        if (err.statusCode === 503 || err.statusCode === 429) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        // Any other error (e.g. invalid key 400/403) → throw immediately
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed. Please try again later.');
}

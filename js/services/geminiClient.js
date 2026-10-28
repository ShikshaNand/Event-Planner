/**
 * Gemini REST Client
 * Communicates with Google Generative Language API securely
 * Supports timeout, model fallback, error handling, and JSON response mode
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Call Gemini Flash with structured prompt
 * @param {string} apiKey 
 * @param {string} prompt 
 * @param {object} [options]
 * @returns {Promise<string>}
 */
export async function callGemini(apiKey, prompt, options = {}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Gemini API key is required to call external GenAI.');
  }

  const model = options.model || 'gemini-1.5-flash';
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      maxOutputTokens: options.maxTokens || 2048,
      responseMimeType: options.jsonMode ? 'application/json' : 'text/plain'
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 25000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Gemini API returned status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMsg = errorData.error.message;
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
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
      throw new Error('Request to Gemini API timed out after 25 seconds.');
    }
    throw err;
  }
}

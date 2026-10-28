/**
 * Sanitization and XSS Prevention Utilities
 * Ensures all user inputs and AI generated content are safely handled
 */

/**
 * Escapes characters that can lead to HTML injection / XSS vulnerabilities.
 * @param {unknown} input 
 * @returns {string}
 */
export function escapeHTML(input) {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips dangerous HTML tags completely from untrusted markdown-like text.
 * @param {string} input 
 * @returns {string}
 */
export function stripTags(input) {
  if (!input) return '';
  return String(input).replace(/<[^>]*>?/gm, '');
}

/**
 * Sanitizes input text, trimming whitespace and limiting maximum length.
 * @param {unknown} input 
 * @param {number} [maxLength=2000]
 * @returns {string}
 */
export function sanitizeInput(input, maxLength = 2000) {
  if (input === null || input === undefined) return '';
  const trimmed = String(input).trim();
  return trimmed.slice(0, maxLength);
}

/**
 * Safely parses JSON with fallback, preventing exceptions.
 * @template T
 * @param {string} jsonString 
 * @param {T} fallback 
 * @returns {T}
 */
export function safeJSONParse(jsonString, fallback) {
  try {
    if (!jsonString) return fallback;
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

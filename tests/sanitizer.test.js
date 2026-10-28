import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHTML, stripTags, sanitizeInput, safeJSONParse } from '../js/utils/sanitizer.js';

test('Sanitizer and Security Utilities', async (t) => {
  await t.test('escapes XSS injection payloads safely', () => {
    const maliciousScript = '<script>alert("xss")</script>';
    const escaped = escapeHTML(maliciousScript);
    assert.equal(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    assert.ok(!escaped.includes('<script>'));
  });

  await t.test('escapes malicious HTML attributes and event handlers', () => {
    const maliciousAttr = '<img src=x onerror=alert(1)>';
    const escaped = escapeHTML(maliciousAttr);
    assert.ok(!escaped.includes('<img'));
    assert.equal(escaped, '&lt;img src=x onerror=alert(1)&gt;');
  });

  await t.test('handles null and undefined gracefully', () => {
    assert.equal(escapeHTML(null), '');
    assert.equal(escapeHTML(undefined), '');
    assert.equal(sanitizeInput(null), '');
  });

  await t.test('strips HTML tags completely when requested', () => {
    const html = '<b>Bold text</b> and <a href="#">link</a>';
    assert.equal(stripTags(html), 'Bold text and link');
  });

  await t.test('safely parses JSON without throwing on malformed strings', () => {
    const valid = safeJSONParse('{"test": 123}', {});
    assert.equal(valid.test, 123);

    const malformed = safeJSONParse('{invalid json syntax}', { fallback: true });
    assert.equal(malformed.fallback, true);
  });
});

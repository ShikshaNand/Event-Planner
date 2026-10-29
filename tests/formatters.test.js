import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  getCurrencySymbol,
  formatDate,
  getDaysRemaining,
  formatPercentage,
  generateId,
  SUPPORTED_CURRENCIES
} from '../js/utils/formatters.js';

test('Formatters and Localization Engine', async (t) => {
  await t.test('formats numbers into localized currency strings', () => {
    const usd = formatCurrency(25000, 'USD');
    assert.ok(usd.includes('$') || usd.includes('25,000') || usd.includes('USD'));

    const inr = formatCurrency(50000, 'INR');
    assert.ok(inr.includes('₹') || inr.includes('50,000') || inr.includes('INR'));

    const jpy = formatCurrency(100000, 'JPY');
    assert.ok(jpy.includes('¥') || jpy.includes('100,000') || jpy.includes('JPY'));

    const eur = formatCurrency(1200, 'EUR');
    assert.ok(eur.includes('€') || eur.includes('1,200') || eur.includes('EUR'));

    // Edge case: zero and negative amounts
    assert.ok(formatCurrency(0, 'USD').length > 0);
    assert.ok(formatCurrency(-500, 'USD').includes('-') || formatCurrency(-500, 'USD').includes('500'));

    // Fallback for custom or unknown currency
    const custom = formatCurrency(100, 'XYZ');
    assert.ok(custom.includes('100'));
  });

  await t.test('retrieves correct currency symbols', () => {
    assert.equal(getCurrencySymbol('USD'), '$');
    assert.equal(getCurrencySymbol('EUR'), '€');
    assert.equal(getCurrencySymbol('GBP'), '£');
    assert.equal(getCurrencySymbol('INR'), '₹');
    assert.equal(getCurrencySymbol('JPY'), '¥');
    assert.equal(getCurrencySymbol('UNKNOWN'), 'UNKNOWN');
  });

  await t.test('formats dates accurately with fallback for invalid input', () => {
    const formatted = formatDate('2026-10-31');
    assert.ok(formatted.includes('2026') && formatted.includes('Oct'));

    assert.equal(formatDate(''), 'Date TBD');
    assert.equal(formatDate(null), 'Date TBD');
    assert.equal(formatDate('invalid-date-string'), 'invalid-date-string');
  });

  await t.test('calculates countdown days remaining accurately', () => {
    const emptyResult = getDaysRemaining('');
    assert.equal(emptyResult.days, 0);
    assert.equal(emptyResult.isPast, false);

    const invalidResult = getDaysRemaining('not-a-date');
    assert.equal(invalidResult.days, 0);

    const pastDate = '2020-01-01';
    const pastResult = getDaysRemaining(pastDate);
    assert.equal(pastResult.isPast, true);
    assert.ok(pastResult.days > 0);
    assert.ok(pastResult.label.includes('days ago'));

    // Today calculation
    const today = new Date().toISOString().split('T')[0];
    const todayResult = getDaysRemaining(today);
    assert.equal(todayResult.days, 0);
    assert.equal(todayResult.isPast, false);
    assert.equal(todayResult.label, 'Today!');
  });

  await t.test('formats percentage values safely', () => {
    assert.equal(formatPercentage(0.75), '75%');
    assert.equal(formatPercentage(1), '100%');
    assert.equal(formatPercentage(0), '0%');
    assert.equal(formatPercentage('0.5'), '50%');
    assert.equal(formatPercentage(null), '0%');
  });

  await t.test('generates unique cryptographic/timestamp identifiers', () => {
    const id1 = generateId('evt');
    const id2 = generateId('evt');
    assert.ok(id1.startsWith('evt_'));
    assert.ok(id2.startsWith('evt_'));
    assert.notEqual(id1, id2);

    const defaultId = generateId();
    assert.ok(defaultId.startsWith('item_'));
  });

  await t.test('ensures SUPPORTED_CURRENCIES is frozen against mutations', () => {
    assert.ok(Object.isFrozen(SUPPORTED_CURRENCIES));
    assert.ok(SUPPORTED_CURRENCIES.length >= 20);
    assert.throws(() => {
      // @ts-ignore
      SUPPORTED_CURRENCIES.push({ code: 'TEST' });
    });
  });
});


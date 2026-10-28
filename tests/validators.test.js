import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent, validateBudgetItem, validateTimelineItem, validateVendor } from '../js/utils/validators.js';

test('Data Integrity and Schema Validators', async (t) => {
  await t.test('validates valid and invalid events', () => {
    const valid = validateEvent({
      title: 'Grand Annual Ball',
      type: 'community',
      date: '2026-10-31',
      totalBudget: 15000
    });
    assert.equal(valid.isValid, true);
    assert.equal(valid.errors.length, 0);

    const invalid = validateEvent({
      title: '',
      type: 'unsupported_type',
      totalBudget: -500
    });
    assert.equal(invalid.isValid, false);
    assert.ok(invalid.errors.length >= 3);
  });

  await t.test('validates budget items', () => {
    const valid = validateBudgetItem({
      category: 'Venue',
      name: 'Hall Rental',
      estimatedCost: 1500,
      actualCost: 1450
    });
    assert.equal(valid.isValid, true);

    const invalid = validateBudgetItem({
      category: '',
      name: '',
      estimatedCost: -100
    });
    assert.equal(invalid.isValid, false);
    assert.ok(invalid.errors.length >= 2);
  });

  await t.test('validates timeline run-of-show items', () => {
    const valid = validateTimelineItem({
      title: 'First Look',
      time: '14:00',
      phase: 'day-of'
    });
    assert.equal(valid.isValid, true);

    const invalid = validateTimelineItem({
      title: '',
      phase: 'invalid_phase'
    });
    assert.equal(invalid.isValid, false);
  });

  await t.test('validates vendor records and email format', () => {
    const valid = validateVendor({
      name: 'Bella Florals',
      category: 'Florals',
      status: 'booked',
      email: 'contact@bellaflorals.com'
    });
    assert.equal(valid.isValid, true);

    const invalidEmail = validateVendor({
      name: 'Bella Florals',
      category: 'Florals',
      email: 'not-an-email'
    });
    assert.equal(invalidEmail.isValid, false);
    assert.ok(invalidEmail.errors.some(e => e.includes('email format')));
  });
});

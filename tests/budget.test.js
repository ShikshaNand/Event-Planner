import test from 'node:test';
import assert from 'node:assert/strict';
import { eventStore } from '../js/state/store.js';

test('Budget Calculations and Summaries', async (t) => {
  await t.test('calculates correct budget totals, effective spend, and variance', () => {
    eventStore.resetToDefaults();
    const event = eventStore.getCurrentEvent();
    assert.ok(event, 'Default event should exist');

    const summary = eventStore.getBudgetSummary(event.id);
    assert.equal(typeof summary.totalBudget, 'number');
    assert.equal(typeof summary.totalEstimated, 'number');
    assert.equal(typeof summary.totalActual, 'number');
    assert.equal(typeof summary.remainingBudget, 'number');
    assert.equal(summary.totalBudget - summary.effectiveSpend, summary.variance);
    assert.ok(summary.percentUsed >= 0 && summary.percentUsed <= 100);
  });

  await t.test('detects when an event is over budget', () => {
    const testEvt = eventStore.addEvent({
      title: 'Budget Test Gala',
      type: 'wedding',
      totalBudget: 5000
    });

    eventStore.addBudgetItem(testEvt.id, {
      category: 'Venue',
      name: 'Grand Ballroom',
      estimatedCost: 6000,
      actualCost: 6500
    });

    const summary = eventStore.getBudgetSummary(testEvt.id);
    assert.equal(summary.isOverBudget, true);
    assert.equal(summary.variance, -1500); // 5000 - 6500
    assert.equal(summary.remainingBudget, -1500);
  });

  await t.test('properly updates and deletes budget items', () => {
    const testEvt = eventStore.addEvent({
      title: 'CRUD Event',
      type: 'birthday',
      totalBudget: 2000
    });

    const item = eventStore.addBudgetItem(testEvt.id, {
      category: 'Catering',
      name: 'Cake and Cupcakes',
      estimatedCost: 300,
      actualCost: 320,
      paidCost: 150
    });

    assert.ok(item.id);
    let summary = eventStore.getBudgetSummary(testEvt.id);
    assert.equal(summary.totalEstimated, 300);
    assert.equal(summary.totalActual, 320);

    eventStore.updateBudgetItem(testEvt.id, item.id, { actualCost: 350 });
    summary = eventStore.getBudgetSummary(testEvt.id);
    assert.equal(summary.totalActual, 350);

    eventStore.deleteBudgetItem(testEvt.id, item.id);
    summary = eventStore.getBudgetSummary(testEvt.id);
    assert.equal(summary.totalActual, 0);
  });
});

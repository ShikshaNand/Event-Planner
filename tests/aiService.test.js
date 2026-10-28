import test from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../js/services/aiService.js';
import { eventStore } from '../js/state/store.js';

test('GenAI Service and Heuristic Problem Solving Engine', async (t) => {
  const ai = new AIService(eventStore);

  await t.test('generates wedding blueprint with appropriate budgets and timeline', async () => {
    const blueprint = await ai.generateEventBlueprint({
      title: 'Romantic Autumn Wedding',
      type: 'wedding',
      date: '2026-10-15',
      guestCount: 120,
      totalBudget: 30000,
      vibe: 'Modern Rustic'
    });

    assert.ok(Array.isArray(blueprint.budgetItems), 'Budget items should be an array');
    assert.ok(blueprint.budgetItems.length >= 5, 'Should generate at least 5 budget categories');
    assert.ok(Array.isArray(blueprint.timeline), 'Timeline should be an array');
    assert.ok(blueprint.timeline.length >= 5, 'Should generate at least 5 timeline milestones');
    assert.ok(Array.isArray(blueprint.ideas), 'Ideas should be an array');
    assert.ok(Array.isArray(blueprint.accessibilityNeeds), 'Accessibility needs should be generated');

    // Verify budget contingency exists
    const hasContingency = blueprint.budgetItems.some(b => b.category.toLowerCase().includes('contingency'));
    assert.ok(hasContingency, 'Blueprint must include an emergency contingency buffer');
  });

  await t.test('generates community festival blueprint with municipal permits and safety', async () => {
    const blueprint = await ai.generateEventBlueprint({
      title: 'City Riverside Festival',
      type: 'community',
      date: '2026-09-20',
      guestCount: 1000,
      totalBudget: 25000
    });

    assert.ok(blueprint.budgetItems.some(b => b.name.toLowerCase().includes('permit') || b.category.toLowerCase().includes('permit')));
    assert.ok(blueprint.accessibilityNeeds.length >= 2, 'Community event must have strong accessibility focus');
  });

  await t.test('solves weather emergency crisis with immediate checklist and calming script', async () => {
    const solution = await ai.solveCrisis({
      problem: 'Sudden thunderstorm with torrential rain and heavy winds during outdoor reception',
      eventType: 'wedding',
      guestCount: 150
    });

    assert.ok(solution.immediateActions.length >= 3, 'Should provide immediate action steps');
    assert.ok(solution.communicationScript.length > 20, 'Should provide ready-to-announce communication script');
    assert.ok(solution.preventativeAdvice.length >= 1, 'Should include preventative lessons');
  });

  await t.test('provides tactical budget optimization cuts and negotiation strategies', async () => {
    const event = eventStore.getCurrentEvent();
    const summary = eventStore.getBudgetSummary(event.id);

    const optimization = await ai.optimizeBudget({
      totalBudget: summary.totalBudget,
      effectiveSpend: summary.effectiveSpend,
      budgetItems: event.budgetItems,
      eventType: event.type,
      savingsGoal: 2000
    });

    assert.ok(optimization.recommendedCuts.length >= 2, 'Should provide multiple recommended cuts');
    assert.ok(optimization.vendorNegotiationTips.length >= 2, 'Should provide actionable negotiation tips');
    assert.ok(typeof optimization.projectedNewTotal === 'number', 'Projected new total should be a number');
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { EventStore, STORAGE_KEY, API_KEY_SESSION_KEY, AI_MODEL_STORAGE_KEY, DEFAULT_AI_MODEL } from '../js/state/store.js';

test('EventStore Lifecycle, State Transitions and Model Management', async (t) => {
  await t.test('initializes with seed data and default model', () => {
    const store = new EventStore();
    assert.ok(store.getEvents().length > 0);
    assert.equal(store.getAiModel(), 'gemini-2.0-flash');
    assert.ok(store.getCurrentEvent());
  });

  await t.test('updates and switches AI model configuration dynamically', () => {
    const store = new EventStore();
    store.setAiModel('llama-3.3-70b-versatile');
    assert.equal(store.getAiModel(), 'llama-3.3-70b-versatile');

    const details = store.getActiveModelDetails();
    assert.equal(details.model, 'llama-3.3-70b-versatile');
    assert.equal(details.provider, 'Groq');
  });

  await t.test('adds, updates, and deletes vendors', () => {
    const store = new EventStore();
    const event = store.getCurrentEvent();
    assert.ok(event);

    const vendor = store.addVendor(event.id, {
      name: 'Starlight Acoustic Quartet',
      category: 'Entertainment',
      cost: 1800,
      status: 'booked'
    });
    assert.ok(vendor);
    assert.equal(vendor.name, 'Starlight Acoustic Quartet');

    const updated = store.updateVendor(event.id, vendor.id, { paid: 900 });
    assert.equal(updated.paid, 900);

    store.deleteVendor(event.id, vendor.id);
    const found = (store.getCurrentEvent().vendors || []).find(v => v.id === vendor.id);
    assert.equal(found, undefined);
  });

  await t.test('adds, updates, and deletes accessibility requirements', () => {
    const store = new EventStore();
    const event = store.getCurrentEvent();
    assert.ok(event);

    const need = store.addAccessibilityNeed(event.id, {
      title: 'Sign Language Interpreter for Keynote',
      status: 'pending'
    });
    assert.ok(need);
    assert.equal(need.title, 'Sign Language Interpreter for Keynote');

    const updated = store.updateAccessibilityNeed(event.id, need.id, { status: 'confirmed' });
    assert.equal(updated.status, 'confirmed');

    store.deleteAccessibilityNeed(event.id, need.id);
    const found = (store.getCurrentEvent().accessibilityNeeds || []).find(n => n.id === need.id);
    assert.equal(found, undefined);
  });

  await t.test('adds and deletes creative ideas', () => {
    const store = new EventStore();
    const event = store.getCurrentEvent();
    assert.ok(event);

    const idea = store.addIdea(event.id, {
      category: 'Decor',
      title: 'Bioluminescent Floral Centerpieces',
      description: 'Fiber optic glow woven through ivy'
    });
    assert.ok(idea);

    store.deleteIdea(event.id, idea.id);
    const found = (store.getCurrentEvent().ideas || []).find(i => i.id === idea.id);
    assert.equal(found, undefined);
  });

  await t.test('exports and imports backup data accurately', () => {
    const store = new EventStore();
    const exportedJSON = store.exportData();
    assert.ok(typeof exportedJSON === 'string');

    const importedCount = store.importData(exportedJSON);
    assert.equal(importedCount, store.getEvents().length);

    assert.throws(() => {
      store.importData('invalid json string');
    });
  });

  await t.test('ensures storage configuration constants are frozen', () => {
    assert.ok(Object.isFrozen(STORAGE_KEY));
    assert.ok(Object.isFrozen(API_KEY_SESSION_KEY));
    assert.ok(Object.isFrozen(AI_MODEL_STORAGE_KEY));
    assert.ok(Object.isFrozen(DEFAULT_AI_MODEL));
  });
});

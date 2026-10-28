/**
 * Central Reactive Event State Store for AuraPlan
 * Manages persistence, state transitions, validation, and analytics
 */

import { INITIAL_EVENTS } from './initialData.js';
import { safeJSONParse } from '../utils/sanitizer.js';
import { generateId } from '../utils/formatters.js';

const STORAGE_KEY = 'auraplan_events_v1';
const API_KEY_SESSION_KEY = 'auraplan_gemini_api_key';

class EventStore {
  constructor() {
    this.listeners = new Set();
    this.events = this.loadFromStorage();
    this.currentEventId = this.events[0]?.id || null;
    this.apiKey = typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage.getItem(API_KEY_SESSION_KEY) || ''
      : '';
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return JSON.parse(JSON.stringify(INITIAL_EVENTS));
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = safeJSONParse(raw, null);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // Seed initial data
    this.saveToStorage(INITIAL_EVENTS);
    return JSON.parse(JSON.stringify(INITIAL_EVENTS));
  }

  saveToStorage(data = this.events) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType = 'update', details = {}) {
    this.saveToStorage();
    for (const listener of this.listeners) {
      try {
        listener(this, { type: changeType, ...details });
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    }
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (this.apiKey) {
        window.sessionStorage.setItem(API_KEY_SESSION_KEY, this.apiKey);
      } else {
        window.sessionStorage.removeItem(API_KEY_SESSION_KEY);
      }
    }
    this.notify('apiKeyUpdate', { hasKey: Boolean(this.apiKey) });
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  getEvents() {
    return this.events;
  }

  getCurrentEvent() {
    return this.events.find(e => e.id === this.currentEventId) || this.events[0] || null;
  }

  setCurrentEvent(id) {
    if (this.events.some(e => e.id === id)) {
      this.currentEventId = id;
      this.notify('eventSwitch', { eventId: id });
    }
  }

  addEvent(eventData) {
    const newEvent = {
      id: generateId('evt'),
      title: eventData.title || 'Untitled Event',
      type: eventData.type || 'wedding',
      date: eventData.date || new Date().toISOString().split('T')[0],
      time: eventData.time || '18:00',
      location: eventData.location || 'TBD Location',
      guestCount: Number(eventData.guestCount) || 50,
      totalBudget: Number(eventData.totalBudget) || 10000,
      currency: eventData.currency || 'USD',
      vibe: eventData.vibe || 'Celebratory and modern',
      colorPalette: eventData.colorPalette || ['#2563EB', '#38BDF8', '#F1F5F9'],
      notes: eventData.notes || '',
      budgetItems: eventData.budgetItems || [],
      timeline: eventData.timeline || [],
      vendors: eventData.vendors || [],
      accessibilityNeeds: eventData.accessibilityNeeds || [],
      ideas: eventData.ideas || []
    };
    this.events.unshift(newEvent);
    this.currentEventId = newEvent.id;
    this.notify('eventAdded', { event: newEvent });
    return newEvent;
  }

  updateEvent(eventId, partial) {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...partial };
      this.notify('eventUpdated', { eventId });
      return this.events[index];
    }
    return null;
  }

  deleteEvent(eventId) {
    if (this.events.length <= 1) {
      throw new Error('You must keep at least one event in your planner.');
    }
    this.events = this.events.filter(e => e.id !== eventId);
    if (this.currentEventId === eventId) {
      this.currentEventId = this.events[0]?.id || null;
    }
    this.notify('eventDeleted', { eventId });
  }

  // --- Budget Operations ---
  addBudgetItem(eventId, item) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return null;
    const newItem = {
      id: generateId('b'),
      category: item.category || 'General',
      name: item.name || 'Expense',
      estimatedCost: Number(item.estimatedCost) || 0,
      actualCost: Number(item.actualCost) || 0,
      paidCost: Number(item.paidCost) || 0,
      status: item.status || 'pending',
      notes: item.notes || ''
    };
    if (!Array.isArray(evt.budgetItems)) evt.budgetItems = [];
    evt.budgetItems.push(newItem);
    this.notify('budgetUpdated', { eventId, itemId: newItem.id });
    return newItem;
  }

  updateBudgetItem(eventId, itemId, partial) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.budgetItems) return null;
    const item = evt.budgetItems.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, {
        ...partial,
        estimatedCost: partial.estimatedCost !== undefined ? Number(partial.estimatedCost) : item.estimatedCost,
        actualCost: partial.actualCost !== undefined ? Number(partial.actualCost) : item.actualCost,
        paidCost: partial.paidCost !== undefined ? Number(partial.paidCost) : item.paidCost
      });
      this.notify('budgetUpdated', { eventId, itemId });
      return item;
    }
    return null;
  }

  deleteBudgetItem(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.budgetItems) return;
    evt.budgetItems = evt.budgetItems.filter(i => i.id !== itemId);
    this.notify('budgetUpdated', { eventId, itemId });
  }

  getBudgetSummary(eventId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) {
      return {
        totalBudget: 0,
        totalEstimated: 0,
        totalActual: 0,
        totalPaid: 0,
        remainingBudget: 0,
        percentUsed: 0,
        isOverBudget: false,
        variance: 0,
        categoryBreakdown: {}
      };
    }

    const items = evt.budgetItems || [];
    let totalEstimated = 0;
    let totalActual = 0;
    let totalPaid = 0;
    const categoryBreakdown = {};

    for (const item of items) {
      const est = Number(item.estimatedCost) || 0;
      const act = Number(item.actualCost) || 0;
      const paid = Number(item.paidCost) || 0;

      totalEstimated += est;
      totalActual += act;
      totalPaid += paid;

      const cat = item.category || 'Other';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { estimated: 0, actual: 0, paid: 0, count: 0 };
      }
      categoryBreakdown[cat].estimated += est;
      categoryBreakdown[cat].actual += act;
      categoryBreakdown[cat].paid += paid;
      categoryBreakdown[cat].count += 1;
    }

    const totalBudget = Number(evt.totalBudget) || 0;
    // Effective committed spend is actual where available, else estimated
    const effectiveSpend = totalActual > 0 ? totalActual : totalEstimated;
    const remainingBudget = totalBudget - effectiveSpend;
    const percentUsed = totalBudget > 0 ? Math.min(100, Math.round((effectiveSpend / totalBudget) * 100)) : 0;
    const isOverBudget = effectiveSpend > totalBudget;
    const variance = totalBudget - effectiveSpend;

    return {
      totalBudget,
      totalEstimated,
      totalActual,
      totalPaid,
      effectiveSpend,
      remainingBudget,
      percentUsed,
      isOverBudget,
      variance,
      categoryBreakdown
    };
  }

  // --- Timeline Operations ---
  addTimelineItem(eventId, item) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return null;
    const newItem = {
      id: generateId('t'),
      phase: item.phase || 'day-of',
      time: item.time || '12:00',
      title: item.title || 'New Milestone',
      description: item.description || '',
      assignee: item.assignee || 'Organizer',
      completed: Boolean(item.completed)
    };
    if (!Array.isArray(evt.timeline)) evt.timeline = [];
    evt.timeline.push(newItem);
    // Sort timeline chronologically
    evt.timeline.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    this.notify('timelineUpdated', { eventId, itemId: newItem.id });
    return newItem;
  }

  updateTimelineItem(eventId, itemId, partial) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.timeline) return null;
    const item = evt.timeline.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, partial);
      evt.timeline.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      this.notify('timelineUpdated', { eventId, itemId });
      return item;
    }
    return null;
  }

  toggleTimelineComplete(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.timeline) return;
    const item = evt.timeline.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      this.notify('timelineUpdated', { eventId, itemId });
    }
  }

  deleteTimelineItem(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.timeline) return;
    evt.timeline = evt.timeline.filter(i => i.id !== itemId);
    this.notify('timelineUpdated', { eventId, itemId });
  }

  // --- Vendor Operations ---
  addVendor(eventId, vendor) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return null;
    const newVendor = {
      id: generateId('v'),
      name: vendor.name || 'Vendor Name',
      category: vendor.category || 'General',
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      status: vendor.status || 'researching',
      cost: Number(vendor.cost) || 0,
      paid: Number(vendor.paid) || 0,
      contractSigned: Boolean(vendor.contractSigned),
      insuranceVerified: Boolean(vendor.insuranceVerified),
      notes: vendor.notes || '',
      backupPlan: vendor.backupPlan || ''
    };
    if (!Array.isArray(evt.vendors)) evt.vendors = [];
    evt.vendors.push(newVendor);
    this.notify('vendorsUpdated', { eventId, vendorId: newVendor.id });
    return newVendor;
  }

  updateVendor(eventId, vendorId, partial) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.vendors) return null;
    const v = evt.vendors.find(i => i.id === vendorId);
    if (v) {
      Object.assign(v, partial);
      this.notify('vendorsUpdated', { eventId, vendorId });
      return v;
    }
    return null;
  }

  deleteVendor(eventId, vendorId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.vendors) return;
    evt.vendors = evt.vendors.filter(i => i.id !== vendorId);
    this.notify('vendorsUpdated', { eventId, vendorId });
  }

  // --- Accessibility Operations ---
  addAccessibilityNeed(eventId, need) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return null;
    const newNeed = {
      id: generateId('acc'),
      title: need.title || 'Accessibility Requirement',
      status: need.status || 'in-progress',
      notes: need.notes || ''
    };
    if (!Array.isArray(evt.accessibilityNeeds)) evt.accessibilityNeeds = [];
    evt.accessibilityNeeds.push(newNeed);
    this.notify('accessibilityUpdated', { eventId, needId: newNeed.id });
    return newNeed;
  }

  updateAccessibilityNeed(eventId, needId, partial) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.accessibilityNeeds) return null;
    const item = evt.accessibilityNeeds.find(i => i.id === needId);
    if (item) {
      Object.assign(item, partial);
      this.notify('accessibilityUpdated', { eventId, needId });
      return item;
    }
    return null;
  }

  deleteAccessibilityNeed(eventId, needId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.accessibilityNeeds) return;
    evt.accessibilityNeeds = evt.accessibilityNeeds.filter(i => i.id !== needId);
    this.notify('accessibilityUpdated', { eventId, needId });
  }

  // --- Ideas Operations ---
  addIdea(eventId, idea) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return null;
    const newIdea = {
      id: generateId('id'),
      category: idea.category || 'Theme',
      title: idea.title || 'Creative Idea',
      description: idea.description || ''
    };
    if (!Array.isArray(evt.ideas)) evt.ideas = [];
    evt.ideas.push(newIdea);
    this.notify('ideasUpdated', { eventId, ideaId: newIdea.id });
    return newIdea;
  }

  deleteIdea(eventId, ideaId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.ideas) return;
    evt.ideas = evt.ideas.filter(i => i.id !== ideaId);
    this.notify('ideasUpdated', { eventId, ideaId });
  }

  // --- Data Management & Backup ---
  resetToDefaults() {
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.currentEventId = this.events[0]?.id || null;
    this.notify('reset', {});
  }

  exportData() {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      events: this.events
    }, null, 2);
  }

  importData(jsonString) {
    const parsed = safeJSONParse(jsonString, null);
    if (!parsed || !Array.isArray(parsed.events) || parsed.events.length === 0) {
      throw new Error('Invalid format: File does not contain valid event data.');
    }
    this.events = parsed.events;
    this.currentEventId = this.events[0]?.id || null;
    this.notify('import', { count: this.events.length });
    return this.events.length;
  }
}

export const eventStore = new EventStore();

/**
 * Central Reactive Event State Store for PlanAura AI
 * Manages reactive state persistence, transitions, validation schemas, and financial analytics
 */

import { INITIAL_EVENTS } from './initialData.js';
import { safeJSONParse } from '../utils/sanitizer.js';
import { generateId } from '../utils/formatters.js';

/**
 * Storage keys and default configuration
 */
export const STORAGE_KEY = Object.freeze('auraplan_events_v2');
export const API_KEY_SESSION_KEY = Object.freeze('auraplan_gemini_api_key');
export const AI_MODEL_STORAGE_KEY = Object.freeze('auraplan_ai_model');
export const DEFAULT_API_KEY = Object.freeze('');
export const DEFAULT_AI_MODEL = Object.freeze('gemini-2.0-flash');

/**
 * @typedef {Object} BudgetItem
 * @property {string} id - Unique budget item ID
 * @property {string} category - Category (e.g., Venue, Catering)
 * @property {string} name - Line item description
 * @property {number} estimatedCost - Estimated initial budget cost
 * @property {number} actualCost - Incurred actual cost
 * @property {number} paidCost - Amount paid to date
 * @property {'pending'|'deposit_paid'|'partial'|'paid'} status - Payment status
 * @property {string} [notes] - Additional line item notes
 */

/**
 * @typedef {Object} TimelineItem
 * @property {string} id - Unique timeline milestone ID
 * @property {'pre-event'|'day-of'|'post-event'} phase - Timeline phase
 * @property {string} time - 24hr or 12hr scheduled time
 * @property {string} title - Milestone title
 * @property {string} [description] - Milestone details or instructions
 * @property {string} [assignee] - Person or team in charge
 * @property {boolean} completed - Milestone completion flag
 */

/**
 * @typedef {Object} Vendor
 * @property {string} id - Unique vendor ID
 * @property {string} name - Vendor company or person name
 * @property {string} category - Service category
 * @property {string} [contactPerson] - Primary contact representative
 * @property {string} [email] - Contact email address
 * @property {string} [phone] - Contact phone number
 * @property {'researching'|'contacted'|'quoted'|'booked'|'paid'} status - Engagement status
 * @property {number} cost - Agreed contract cost
 * @property {number} paid - Amount paid to date
 * @property {boolean} contractSigned - Whether formal contract was signed
 * @property {boolean} insuranceVerified - Whether Certificate of Insurance (COI) is on file
 * @property {string} [notes] - Vendor coordination notes
 * @property {string} [backupPlan] - Contingency backup arrangement
 */

/**
 * @typedef {Object} AccessibilityNeed
 * @property {string} id - Unique requirement ID
 * @property {string} title - Requirement headline
 * @property {'in-progress'|'confirmed'|'pending'} status - Status of accommodation
 * @property {string} [notes] - Operational accommodation details
 */

/**
 * @typedef {Object} Idea
 * @property {string} id - Unique idea ID
 * @property {string} category - Idea category
 * @property {string} title - Concept title
 * @property {string} description - Detailed creative blueprint
 */

/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {'wedding'|'birthday'|'community'|'other'} type - Event classification
 * @property {string} date - Event date in YYYY-MM-DD format
 * @property {string} time - Event start time in HH:MM format
 * @property {string} location - Event venue or setting
 * @property {number} guestCount - Expected guest attendance
 * @property {number} totalBudget - Total target budget
 * @property {string} currency - 3-letter ISO currency code
 * @property {string} vibe - Creative theme description
 * @property {string[]} colorPalette - Hex color codes for the theme
 * @property {string} [notes] - General planning notes
 * @property {BudgetItem[]} budgetItems - Financial ledger items
 * @property {TimelineItem[]} timeline - Run-of-show timeline milestones
 * @property {Vendor[]} vendors - Contracted vendor records
 * @property {AccessibilityNeed[]} accessibilityNeeds - Guest accommodation requirements
 * @property {Idea[]} ideas - Creative inspiration items
 */

/**
 * @typedef {Object} BudgetSummary
 * @property {number} totalBudget - Overall budget ceiling
 * @property {number} totalEstimated - Sum of all estimated costs
 * @property {number} totalActual - Sum of all actual incurred costs
 * @property {number} totalPaid - Total cash paid out to date
 * @property {number} effectiveSpend - Total committed spend (actual if present, else estimated)
 * @property {number} remainingBudget - Remaining available budget
 * @property {number} percentUsed - Budget utilization percentage (0 - 100)
 * @property {boolean} isOverBudget - True if effective spend exceeds total budget
 * @property {number} variance - Budget delta (positive = under, negative = over)
 * @property {Record<string, { estimated: number, actual: number, paid: number, count: number }>} categoryBreakdown - Category summary
 */

/**
 * @typedef {Object} ActiveModelDetails
 * @property {string} model - Model identifier string
 * @property {'Gemini'|'Groq'} provider - Provider platform name
 * @property {boolean} hasKey - Whether API key is configured
 * @property {string} label - Human-readable UI badge label
 */

/**
 * Reactive Event State Store Class
 */
export class EventStore {
  /**
   * Initializes the store with persisted or seed data and sets up reactive listeners
   */
  constructor() {
    /** @type {Set<Function>} */
    this.listeners = new Set();
    /** @type {Event[]} */
    this.events = this.loadFromStorage();
    /** @type {string|null} */
    this.currentEventId = this.events[0]?.id || null;

    // Load API key from local or session storage, or default to configured key
    if (typeof window !== 'undefined') {
      const stored = window.localStorage?.getItem(API_KEY_SESSION_KEY) ||
                     window.sessionStorage?.getItem(API_KEY_SESSION_KEY);
      if (stored) {
        this.apiKey = stored;
      } else {
        this.apiKey = DEFAULT_API_KEY;
        try {
          window.localStorage?.setItem(API_KEY_SESSION_KEY, DEFAULT_API_KEY);
          window.sessionStorage?.setItem(API_KEY_SESSION_KEY, DEFAULT_API_KEY);
        } catch { /* ignore storage errors */ }
      }
      this.aiModel = window.localStorage?.getItem(AI_MODEL_STORAGE_KEY) || DEFAULT_AI_MODEL;
    } else {
      this.apiKey = DEFAULT_API_KEY;
      this.aiModel = DEFAULT_AI_MODEL;
    }
  }

  /**
   * Loads persisted events from localStorage or falls back to seed data
   * @returns {Event[]} Parsed events array
   */
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

  /**
   * Persists events array to localStorage
   * @param {Event[]} [data=this.events] - Events to save
   * @returns {void}
   */
  saveToStorage(data = this.events) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn('Could not persist to localStorage:', err);
      }
    }
  }

  /**
   * Subscribes a listener callback to state changes
   * @param {Function} listener - Callback invoked on state mutation
   * @returns {Function} Unsubscribe teardown function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts mutation events to all subscribed listeners
   * @param {string} [changeType='update'] - Type identifier of the mutation
   * @param {Record<string, any>} [details={}] - Additional event payload
   * @returns {void}
   */
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

  /**
   * Sets and persists the AI API key
   * @param {string} key - API Key token
   * @returns {void}
   */
  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (typeof window !== 'undefined') {
      try {
        if (this.apiKey) {
          window.localStorage?.setItem(API_KEY_SESSION_KEY, this.apiKey);
          window.sessionStorage?.setItem(API_KEY_SESSION_KEY, this.apiKey);
        } else {
          window.localStorage?.removeItem(API_KEY_SESSION_KEY);
          window.sessionStorage?.removeItem(API_KEY_SESSION_KEY);
        }
      } catch { /* ignore storage errors */ }
    }
    this.notify('apiKeyUpdate', { hasKey: Boolean(this.apiKey) });
  }

  /**
   * Retrieves active API key
   * @returns {string} The configured API key
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Checks whether a valid API key is present
   * @returns {boolean} True if key exists and exceeds minimal length
   */
  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Sets and persists active AI model
   * @param {string} model - Model identifier (e.g. gemini-2.0-flash, llama-3.3-70b-versatile)
   * @returns {void}
   */
  setAiModel(model) {
    this.aiModel = (model || DEFAULT_AI_MODEL).trim();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(AI_MODEL_STORAGE_KEY, this.aiModel);
      } catch { /* ignore storage errors */ }
    }
    this.notify('aiModelUpdate', { model: this.aiModel });
  }

  /**
   * Retrieves active AI model identifier
   * @returns {string} Model name
   */
  getAiModel() {
    return this.aiModel || DEFAULT_AI_MODEL;
  }

  /**
   * Returns metadata and display status for the active AI model
   * @returns {ActiveModelDetails} Model details including provider and UI status badge
   */
  getActiveModelDetails() {
    const model = this.getAiModel();
    const key = this.getApiKey();
    const isGroq = key.startsWith('gsk_') || model.startsWith('llama-') || model.startsWith('mixtral-');
    const provider = isGroq ? 'Groq' : 'Gemini';

    return {
      model,
      provider,
      hasKey: this.hasApiKey(),
      label: this.hasApiKey() ? `🟢 ${model} (${provider})` : '⚡ Built-in Expert Engine'
    };
  }

  /**
   * Retrieves all managed events
   * @returns {Event[]} Array of events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Retrieves current active event
   * @returns {Event|null} Active event or null
   */
  getCurrentEvent() {
    return this.events.find(e => e.id === this.currentEventId) || this.events[0] || null;
  }

  /**
   * Switches active event selection
   * @param {string} id - Target event ID
   * @returns {void}
   */
  setCurrentEvent(id) {
    if (this.events.some(e => e.id === id)) {
      this.currentEventId = id;
      this.notify('eventSwitch', { eventId: id });
    }
  }

  /**
   * Creates a new event with defaults and adds it to store
   * @param {Partial<Event>} eventData - Initial event parameters
   * @returns {Event} Created event object
   */
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

  /**
   * Updates existing event properties
   * @param {string} eventId - Target event ID
   * @param {Partial<Event>} partial - Properties to merge
   * @returns {Event|null} Updated event or null if not found
   */
  updateEvent(eventId, partial) {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...partial };
      this.notify('eventUpdated', { eventId });
      return this.events[index];
    }
    return null;
  }

  /**
   * Deletes an event by ID and ensures a valid event remains selected
   * @param {string} eventId - ID of event to remove
   * @returns {void}
   */
  deleteEvent(eventId) {
    this.events = this.events.filter(e => e.id !== eventId);
    if (this.events.length === 0) {
      // Create a clean new event template so planner stays functional
      const freshEvent = {
        id: generateId('evt'),
        title: 'New Gathering',
        type: 'wedding',
        date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        time: '18:00',
        location: 'Venue Location TBD',
        guestCount: 50,
        totalBudget: 10000,
        currency: 'USD',
        vibe: 'Warm, memorable and curated with purpose',
        colorPalette: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
        budgetItems: [],
        timeline: [],
        vendors: [],
        ideas: [],
        accessibilityNeeds: []
      };
      this.events.push(freshEvent);
    }
    if (this.currentEventId === eventId || !this.events.some(e => e.id === this.currentEventId)) {
      this.currentEventId = this.events[0]?.id || null;
    }
    this.notify('eventDeleted', { eventId });
  }

  // --- Budget Operations ---

  /**
   * Appends a budget line item to the specified event
   * @param {string} eventId - Target event ID
   * @param {Partial<BudgetItem>} item - Item attributes
   * @returns {BudgetItem|null} Created item or null
   */
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

  /**
   * Updates an existing budget line item
   * @param {string} eventId - Target event ID
   * @param {string} itemId - Target budget item ID
   * @param {Partial<BudgetItem>} partial - Properties to merge
   * @returns {BudgetItem|null} Updated item or null
   */
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

  /**
   * Deletes a budget item by ID
   * @param {string} eventId - Target event ID
   * @param {string} itemId - Target item ID
   * @returns {void}
   */
  deleteBudgetItem(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.budgetItems) return;
    evt.budgetItems = evt.budgetItems.filter(i => i.id !== itemId);
    this.notify('budgetUpdated', { eventId, itemId });
  }

  /**
   * Calculates comprehensive budget financial health metrics
   * @param {string} eventId - Target event ID
   * @returns {BudgetSummary} Aggregated budget metrics and status
   */
  getBudgetSummary(eventId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) {
      return {
        totalBudget: 0,
        totalEstimated: 0,
        totalActual: 0,
        totalPaid: 0,
        effectiveSpend: 0,
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

  /**
   * Appends and chronologically sorts a timeline milestone
   * @param {string} eventId - Target event ID
   * @param {Partial<TimelineItem>} item - Milestone attributes
   * @returns {TimelineItem|null} Created milestone or null
   */
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

  /**
   * Updates an existing timeline milestone and re-sorts schedule
   * @param {string} eventId - Target event ID
   * @param {string} itemId - Target milestone ID
   * @param {Partial<TimelineItem>} partial - Properties to merge
   * @returns {TimelineItem|null} Updated milestone or null
   */
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

  /**
   * Toggles completion status of a timeline milestone
   * @param {string} eventId - Target event ID
   * @param {string} itemId - Target milestone ID
   * @returns {void}
   */
  toggleTimelineComplete(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.timeline) return;
    const item = evt.timeline.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      this.notify('timelineUpdated', { eventId, itemId });
    }
  }

  /**
   * Deletes a milestone by ID
   * @param {string} eventId - Target event ID
   * @param {string} itemId - Milestone ID to remove
   * @returns {void}
   */
  deleteTimelineItem(eventId, itemId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.timeline) return;
    evt.timeline = evt.timeline.filter(i => i.id !== itemId);
    this.notify('timelineUpdated', { eventId, itemId });
  }

  // --- Vendor Operations ---

  /**
   * Adds a new vendor profile
   * @param {string} eventId - Target event ID
   * @param {Partial<Vendor>} vendor - Vendor attributes
   * @returns {Vendor|null} Created vendor or null
   */
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

  /**
   * Updates an existing vendor profile
   * @param {string} eventId - Target event ID
   * @param {string} vendorId - Target vendor ID
   * @param {Partial<Vendor>} partial - Properties to merge
   * @returns {Vendor|null} Updated vendor or null
   */
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

  /**
   * Deletes a vendor profile by ID
   * @param {string} eventId - Target event ID
   * @param {string} vendorId - Vendor ID to delete
   * @returns {void}
   */
  deleteVendor(eventId, vendorId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.vendors) return;
    evt.vendors = evt.vendors.filter(i => i.id !== vendorId);
    this.notify('vendorsUpdated', { eventId, vendorId });
  }

  // --- Accessibility Operations ---

  /**
   * Adds an accessibility requirement
   * @param {string} eventId - Target event ID
   * @param {Partial<AccessibilityNeed>} need - Need attributes
   * @returns {AccessibilityNeed|null} Created requirement or null
   */
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

  /**
   * Updates an accessibility requirement
   * @param {string} eventId - Target event ID
   * @param {string} needId - Target requirement ID
   * @param {Partial<AccessibilityNeed>} partial - Properties to merge
   * @returns {AccessibilityNeed|null} Updated requirement or null
   */
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

  /**
   * Deletes an accessibility requirement
   * @param {string} eventId - Target event ID
   * @param {string} needId - Requirement ID to delete
   * @returns {void}
   */
  deleteAccessibilityNeed(eventId, needId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.accessibilityNeeds) return;
    evt.accessibilityNeeds = evt.accessibilityNeeds.filter(i => i.id !== needId);
    this.notify('accessibilityUpdated', { eventId, needId });
  }

  // --- Ideas Operations ---

  /**
   * Adds a creative idea or theme inspiration
   * @param {string} eventId - Target event ID
   * @param {Partial<Idea>} idea - Idea attributes
   * @returns {Idea|null} Created idea or null
   */
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

  /**
   * Deletes a creative idea by ID
   * @param {string} eventId - Target event ID
   * @param {string} ideaId - Idea ID to remove
   * @returns {void}
   */
  deleteIdea(eventId, ideaId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt || !evt.ideas) return;
    evt.ideas = evt.ideas.filter(i => i.id !== ideaId);
    this.notify('ideasUpdated', { eventId, ideaId });
  }

  // --- Data Management & Backup ---

  /**
   * Resets the store back to canonical default events
   * @returns {void}
   */
  resetToDefaults() {
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.currentEventId = this.events[0]?.id || null;
    this.notify('reset', {});
  }

  /**
   * Serializes the full state into a portable backup JSON string
   * @returns {string} Formatted JSON payload
   */
  exportData() {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      events: this.events
    }, null, 2);
  }

  /**
   * Imports and hydrates event data from a backup JSON string
   * @param {string} jsonString - Serialized state string
   * @throws {Error} If payload is malformed or invalid
   * @returns {number} Number of imported events
   */
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

/**
 * Main Application Bootstrap & Client Router for PlanAura AI
 * Orchestrates event switching, interactive navigation tabs, global hero widgets, and reactive store binding
 */

import { eventStore } from './state/store.js';
import { AIService } from './services/aiService.js';
import { initAIDrawer } from './components/aiDrawer.js';
import { showToast } from './components/toast.js';
import { openModal, closeModal } from './components/modal.js';
import { printEventDossier } from './services/exportService.js';
import { escapeHTML } from './utils/sanitizer.js';
import { formatDate } from './utils/formatters.js';

// Views
import { renderDashboardView } from './views/dashboardView.js';
import { renderBudgetView } from './views/budgetView.js';
import { renderTimelineView } from './views/timelineView.js';
import { renderVendorView } from './views/vendorView.js';
import { renderIdeasView } from './views/ideasView.js';
import { renderCrisisView } from './views/crisisView.js';
import { renderGuestView } from './views/guestView.js';

/**
 * Main Application Orchestrator Class
 * @class
 */
class App {
  /**
   * Initializes application state, reactive bindings, and loads initial views
   * @constructor
   */
  constructor() {
    /** @type {import('./state/store.js').EventStore} */
    this.store = eventStore;
    /** @type {AIService} */
    this.aiService = new AIService(this.store);
    /** @type {string} */
    this.activeTab = 'dashboard';
    /** @type {string} */
    this.theme = localStorage.getItem('auraplan_theme') || 'dark';

    this.initTheme();
    this.initDrawer();
    this.bindEvents();
    this.render();

    // Subscribe to reactive store mutations
    this.store.subscribe((_store, _action) => {
      this.render();
    });
  }

  /**
   * Applies the theme preference to the root document element and toggles button icons
   * @returns {void}
   */
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  /**
   * Toggles theme state between dark and light, persisting choice in localStorage
   * @returns {void}
   */
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('auraplan_theme', this.theme);
    } catch { /* ignore storage errors */ }
    this.initTheme();
  }

  /**
   * Instantiates and configures the AI Assistant Drawer component
   * @returns {void}
   */
  initDrawer() {
    this.drawer = initAIDrawer(this.store, this.aiService, (newEventId) => {
      this.store.setCurrentEvent(newEventId);
      this.activeTab = 'dashboard';
      this.render();
    });
  }

  /**
   * Attaches event listeners for global navigation, currency switching, and print triggers
   * @returns {void}
   */
  bindEvents() {
    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // AI Drawer trigger
    document.getElementById('open-ai-drawer-btn')?.addEventListener('click', () => {
      this.drawer?.open('blueprint');
    });

    // Event Switcher dropdown
    const eventSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('global-event-select'));
    eventSelect?.addEventListener('change', (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      this.store.setCurrentEvent(target.value);
    });

    // "New Event" button in top nav
    document.getElementById('new-event-btn')?.addEventListener('click', () => {
      this.drawer?.open('blueprint');
    });

    // "Delete Event" button in top nav
    document.getElementById('delete-event-header-btn')?.addEventListener('click', () => {
      this.confirmDeleteEvent();
    });

    // Global Currency Select
    const currencySelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('global-currency-select'));
    currencySelect?.addEventListener('change', (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      const newCurrency = target.value;
      const current = this.store.getCurrentEvent();
      if (current) {
        this.store.updateEvent(current.id, { currency: newCurrency });
        showToast(`Currency changed to ${newCurrency}`, 'info');
      }
    });

    // Print Dossier
    document.getElementById('print-dossier-btn')?.addEventListener('click', () => {
      printEventDossier();
    });

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.navigateTo(tab);
        }
      });
    });
  }

  /**
   * Displays an accessible confirmation modal before permanently deleting an active event plan
   * @returns {void}
   */
  confirmDeleteEvent() {
    const current = this.store.getCurrentEvent();
    if (!current) return;

    const contentHtml = `
      <div style="padding: 0.5rem 0;">
        <div style="font-size: 2.2rem; text-align: center; margin-bottom: 0.75rem;">🗑️</div>
        <p style="font-size: 1rem; color: var(--text-primary); text-align: center; margin-bottom: 1rem; line-height: 1.5;">
          Are you sure you want to delete <strong>"${escapeHTML(current.title)}"</strong>?
        </p>
        <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          ⚠️ This will delete this event plan and all associated budget items, milestones, vendor records, and ideas.
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary btn-sm cancel-delete-btn">Cancel</button>
      <button class="btn btn-danger btn-sm confirm-delete-btn">Yes, Delete Plan</button>
    `;

    const modal = openModal({
      title: 'Delete Event Plan',
      contentHtml,
      footerHtml
    });

    modal.querySelector('.cancel-delete-btn')?.addEventListener('click', closeModal);
    modal.querySelector('.confirm-delete-btn')?.addEventListener('click', () => {
      const title = current.title;
      this.store.deleteEvent(current.id);
      closeModal();
      showToast(`Deleted plan: "${title}"`, 'info');
      this.render();
    });
  }

  /**
   * Switches active navigation tab and updates UI state
   * @param {string} tab - Target tab identifier (e.g. 'dashboard', 'budget', 'timeline', 'vendors', 'ideas', 'crisis', 'accessibility')
   * @returns {void}
   */
  navigateTo(tab) {
    this.activeTab = tab;
    // Update tab button classes and aria-selected states
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    this.renderMainContent();
  }

  /**
   * Top-level render loop: refreshes navigation, hero banner, and current active tab view
   * @returns {void}
   */
  render() {
    this.renderTopNav();
    this.renderHero();
    this.renderMainContent();
  }

  /**
   * Synchronizes top header dropdown options with current events and currency state
   * @returns {void}
   */
  renderTopNav() {
    const events = this.store.getEvents();
    const current = this.store.getCurrentEvent();
    const select = /** @type {HTMLSelectElement|null} */ (document.getElementById('global-event-select'));
    const currencySelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('global-currency-select'));

    if (select) {
      select.innerHTML = events.map(e => `
        <option value="${e.id}" ${current && current.id === e.id ? 'selected' : ''}>
          ${escapeHTML(e.title)} (${e.type})
        </option>
      `).join('');
    }

    if (currencySelect && current) {
      currencySelect.value = current.currency || 'USD';
    }
  }

  /**
   * Renders the event overview hero banner with metadata badges and quick actions
   * @returns {void}
   */
  renderHero() {
    const hero = document.getElementById('event-hero-section');
    const event = this.store.getCurrentEvent();
    if (!hero || !event) return;

    hero.innerHTML = `
      <div class="hero-content">
        <div class="hero-header-row">
          <div class="hero-title-group">
            <div class="hero-meta-badges">
              <span class="badge badge-${event.type}">${escapeHTML(event.type)}</span>
              <span class="badge badge-neutral">📍 ${escapeHTML(event.location || 'Location TBD')}</span>
              <span class="badge badge-neutral">👥 ${event.guestCount || 0} Guests</span>
            </div>
            <h1 style="margin-top: 0.25rem;">${escapeHTML(event.title)}</h1>
          </div>

          <div class="hero-action-toolbar">
            <button class="btn btn-outline btn-sm" id="hero-edit-event-btn" title="Edit Date, Time & Details">✏️ Edit Date & Details</button>
            <button class="btn btn-ai btn-sm pulse-glow" id="hero-ai-assistant-btn">✨ AI Copilot</button>
            <button class="btn btn-danger btn-sm" id="hero-crisis-btn">🚨 Crisis Solver</button>
            <button class="btn btn-outline btn-sm" id="hero-print-btn">🖨️ Print / PDF</button>
            <button class="btn btn-outline btn-sm delete-plan-btn" id="hero-delete-btn" style="color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.4);" title="Delete this event plan">🗑️ Delete Plan</button>
          </div>
        </div>

        <div class="hero-details-row">
          <div class="hero-detail-item">
            <span>📅</span>
            <strong>${formatDate(event.date)}</strong> at ${escapeHTML(event.time || '18:00')}
          </div>
          <div class="hero-detail-item">
            <span>🎨</span>
            <span>Palette:</span>
            <div class="palette-container">
              ${(event.colorPalette || []).map(hex => `
                <div class="palette-swatch" style="background-color: ${escapeHTML(hex)};" title="${escapeHTML(hex)}"></div>
              `).join('')}
            </div>
          </div>
          <div class="hero-detail-item" style="max-width: 600px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span>✨</span>
            <span style="font-style: italic;">"${escapeHTML(event.vibe || '')}"</span>
          </div>
        </div>
      </div>
    `;

    // Connect Hero buttons
    hero.querySelector('#hero-edit-event-btn')?.addEventListener('click', () => {
      this.showEditEventModal();
    });

    hero.querySelector('#hero-ai-assistant-btn')?.addEventListener('click', () => {
      this.drawer?.open('chat');
    });

    hero.querySelector('#hero-crisis-btn')?.addEventListener('click', () => {
      this.navigateTo('crisis');
    });

    hero.querySelector('#hero-print-btn')?.addEventListener('click', () => {
      printEventDossier();
    });

    hero.querySelector('#hero-delete-btn')?.addEventListener('click', () => {
      this.confirmDeleteEvent();
    });
  }

  /**
   * Displays the comprehensive event metadata and target date editor modal
   * @returns {void}
   */
  showEditEventModal() {
    const current = this.store.getCurrentEvent();
    if (!current) return;

    const contentHtml = `
      <form id="edit-event-full-form">
        <div class="form-group">
          <label class="form-label">Event Title *</label>
          <input type="text" class="form-input" id="edit-evt-title" value="${escapeHTML(current.title || '')}" required />
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Target Date * (Controls Countdown)</label>
            <input type="date" class="form-input" id="edit-evt-date" value="${escapeHTML(current.date || '')}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input type="time" class="form-input" id="edit-evt-time" value="${escapeHTML(current.time || '18:00')}" />
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Event Type</label>
            <select class="form-select" id="edit-evt-type">
              <option value="wedding" ${current.type === 'wedding' ? 'selected' : ''}>💍 Wedding & Reception</option>
              <option value="birthday" ${current.type === 'birthday' ? 'selected' : ''}>🎉 Birthday / Milestone Jubilee</option>
              <option value="community" ${current.type === 'community' ? 'selected' : ''}>🎪 Community Festival / Gala</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Expected Attendance (Guests)</label>
            <input type="number" class="form-input" id="edit-evt-guests" min="1" value="${current.guestCount || 50}" />
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Total Budget (${escapeHTML(current.currency || 'USD')})</label>
            <input type="number" class="form-input" id="edit-evt-budget" min="0" step="1" value="${current.totalBudget || 10000}" />
          </div>
          <div class="form-group">
            <label class="form-label">Location / Setting</label>
            <input type="text" class="form-input" id="edit-evt-location" value="${escapeHTML(current.location || '')}" placeholder="e.g. Glasshouse Gardens or Downtown Loft" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Creative Vibe & Theme Blueprint</label>
          <textarea class="form-textarea" id="edit-evt-vibe" placeholder="Describe aesthetic, atmosphere, music style...">${escapeHTML(current.vibe || '')}</textarea>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary btn-sm cancel-edit-btn">Cancel</button>
      <button class="btn btn-primary btn-sm save-edit-btn">Save Changes</button>
    `;

    const modal = openModal({
      title: '✏️ Edit Event Details & Target Date',
      contentHtml,
      footerHtml
    });

    modal.querySelector('.cancel-edit-btn')?.addEventListener('click', closeModal);
    modal.querySelector('.save-edit-btn')?.addEventListener('click', () => {
      const form = /** @type {HTMLFormElement} */ (modal.querySelector('#edit-event-full-form'));
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const updated = {
        title: (/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-title'))).value.trim(),
        type: (/** @type {HTMLSelectElement} */ (modal.querySelector('#edit-evt-type'))).value,
        date: (/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-date'))).value,
        time: (/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-time'))).value || '18:00',
        guestCount: Number((/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-guests'))).value) || 0,
        totalBudget: Number((/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-budget'))).value) || 0,
        location: (/** @type {HTMLInputElement} */ (modal.querySelector('#edit-evt-location'))).value.trim(),
        vibe: (/** @type {HTMLTextAreaElement} */ (modal.querySelector('#edit-evt-vibe'))).value.trim()
      };

      this.store.updateEvent(current.id, updated);
      closeModal();
      showToast('Event details and countdown updated!', 'success');
      this.render();
    });
  }

  /**
   * Renders the active tab view into the main content viewport
   * @returns {void}
   */
  renderMainContent() {
    const main = document.getElementById('main-content-view');
    const event = this.store.getCurrentEvent();
    if (!main) return;

    main.innerHTML = '';
    let viewElement = null;

    switch (this.activeTab) {
      case 'dashboard':
        viewElement = renderDashboardView(event, this.store, this.aiService, (tab) => this.navigateTo(tab), () => this.showEditEventModal());
        break;
      case 'budget':
        viewElement = renderBudgetView(event, this.store, this.aiService);
        break;
      case 'timeline':
        viewElement = renderTimelineView(event, this.store, this.aiService);
        break;
      case 'vendors':
        viewElement = renderVendorView(event, this.store, this.aiService);
        break;
      case 'ideas':
        viewElement = renderIdeasView(event, this.store, this.aiService);
        break;
      case 'crisis':
        viewElement = renderCrisisView(event, this.store, this.aiService);
        break;
      case 'accessibility':
        viewElement = renderGuestView(event, this.store, this.aiService);
        break;
      default:
        viewElement = renderDashboardView(event, this.store, this.aiService, (tab) => this.navigateTo(tab));
    }

    if (viewElement) {
      main.appendChild(viewElement);
    }
  }
}

// Bootstrap when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.auraplanApp = new App();
  });
}

export { App };

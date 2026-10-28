/**
 * GenAI Copilot Drawer & Assistant Panel
 */

import { escapeHTML } from '../utils/sanitizer.js';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '../utils/formatters.js';
import { showToast } from './toast.js';

let drawerInstance = null;

export function initAIDrawer(store, aiService, onEventAdded) {
  if (drawerInstance) return drawerInstance;

  const overlay = document.createElement('div');
  overlay.className = 'ai-drawer-overlay';

  const drawer = document.createElement('div');
  drawer.className = 'ai-drawer';
  drawer.setAttribute('role', 'complementary');
  drawer.setAttribute('aria-label', 'PlanAura GenAI Copilot');

  drawer.innerHTML = `
    <div class="drawer-header">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.3rem;">✨</span>
        <div>
          <h3 style="font-size: 1.1rem; line-height: 1.1;">PlanAura GenAI Copilot</h3>
          <span style="font-size: 0.72rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;" id="ai-engine-status-badge">
            ${store.hasApiKey() ? '🟢 Live Gemini API' : '⚡ Built-in Expert Engine'}
          </span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm close-drawer-btn" aria-label="Close Assistant">✕</button>
    </div>

    <!-- Mode Selector Tabs inside Drawer -->
    <div style="display: flex; border-bottom: 1px solid var(--border-subtle); background: var(--bg-tertiary);">
      <button class="btn drawer-tab-btn active" data-tab="blueprint" style="flex: 1; border-radius: 0; font-size: 0.8rem; padding: 0.6rem 0.25rem;">
        🏗️ Event Blueprint
      </button>
      <button class="btn drawer-tab-btn" data-tab="chat" style="flex: 1; border-radius: 0; font-size: 0.8rem; padding: 0.6rem 0.25rem;">
        💬 Ask Copilot
      </button>
      <button class="btn drawer-tab-btn" data-tab="settings" style="flex: 1; border-radius: 0; font-size: 0.8rem; padding: 0.6rem 0.25rem;">
        🔑 API & Keys
      </button>
    </div>

    <div class="drawer-body">
      <!-- Blueprint Tab -->
      <div id="drawer-tab-blueprint" class="drawer-tab-content">
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Generate an end-to-end, fully realistic event plan from scratch in seconds:
        </p>

        <form id="blueprint-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Event Type</label>
            <select class="form-select" id="bp-type">
              <option value="wedding">💍 Wedding & Reception</option>
              <option value="birthday">🎉 Birthday / Milestone Jubilee</option>
              <option value="community">🎪 Community Festival / Gala / 5K</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Event Title *</label>
            <input type="text" class="form-input" id="bp-title" placeholder="e.g. Autumn Highlands Wedding" required />
          </div>

          <div class="form-grid-2">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Event Date *</label>
              <input type="date" class="form-input" id="bp-date" required />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Start Time</label>
              <input type="time" class="form-input" id="bp-time" value="18:00" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Currency</label>
            <select class="form-select" id="bp-currency">
              ${SUPPORTED_CURRENCIES.map(c => `<option value="${c.code}" ${c.code === 'USD' ? 'selected' : ''}>${c.symbol} ${c.code} — ${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-grid-2">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Total Budget</label>
              <input type="number" class="form-input" id="bp-budget" placeholder="25000" min="0" step="1" value="25000" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Guest Count</label>
              <input type="number" class="form-input" id="bp-guests" placeholder="100" min="1" value="100" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Aesthetic Vibe & Theme</label>
            <input type="text" class="form-input" id="bp-vibe" placeholder="e.g. Modern botanical elegance, Warm lighting, live jazz" />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Location / Setting</label>
            <input type="text" class="form-input" id="bp-location" placeholder="e.g. Wine country vineyard or downtown industrial loft" />
          </div>

          <button type="submit" class="btn btn-ai" id="bp-submit-btn" style="margin-top: 0.5rem;">
            ⚡ Generate Complete Event Blueprint
          </button>
        </form>

        <div id="bp-loading" style="display: none; text-align: center; padding: 2rem;">
          <div class="loading-spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: var(--accent-primary);"></div>
          <p style="margin-top: 0.75rem; color: var(--accent-primary); font-size: 0.9rem; font-weight: 600;">Assembling budgets, vendors, timeline & ideas...</p>
        </div>
      </div>

      <!-- Chat Tab -->
      <div id="drawer-tab-chat" class="drawer-tab-content" style="display: none; height: 100%; flex-direction: column;">
        <div id="copilot-chat-history" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; min-height: 280px; max-height: 420px; padding: 0.5rem 0;">
          <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.85rem; border-left: 3px solid var(--accent-primary);">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">✨ PlanAura Live GenAI Copilot</div>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Ask any logistical question, request custom schedules, menu ideas, or vendor negotiation scripts:</p>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;" id="chat-quick-chips">
              <button class="badge badge-ai chat-chip" style="cursor: pointer; border: 1px solid var(--border-subtle);">⏱️ Draft 4-hour evening schedule</button>
              <button class="badge badge-ai chat-chip" style="cursor: pointer; border: 1px solid var(--border-subtle);">🍹 3 signature cocktails & mocktails</button>
              <button class="badge badge-ai chat-chip" style="cursor: pointer; border: 1px solid var(--border-subtle);">💰 How to save 15% on catering</button>
              <button class="badge badge-ai chat-chip" style="cursor: pointer; border: 1px solid var(--border-subtle);">📋 14-day pre-event checklist</button>
            </div>
          </div>
        </div>

        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
          <input type="text" id="copilot-query-input" class="form-input" placeholder="Ask your planning question..." />
          <button class="btn btn-ai btn-sm" id="copilot-query-send">Send</button>
        </div>
      </div>

      <!-- Settings Tab -->
      <div id="drawer-tab-settings" class="drawer-tab-content" style="display: none;">
        <h4 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--text-primary);">Gemini API Key Configuration</h4>

        <div style="background: ${store.hasApiKey() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)'}; border: 1px solid ${store.hasApiKey() ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}; padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem;" id="api-status-banner">
          <strong style="color: ${store.hasApiKey() ? 'var(--accent-emerald)' : 'var(--accent-primary)'};" id="api-status-title">${store.hasApiKey() ? '✓ Live Gemini Flash Active' : '⚡ Built-in Expert Engine Active'}</strong>
          <p style="color: var(--text-secondary); margin-top: 0.2rem;" id="api-status-desc">${store.hasApiKey() ? 'Your Gemini API key is configured. Blueprints, Copilot, accessibility audits, and budget optimization are powered by Google Gemini.' : 'Enter your Google Gemini API key below to unlock live AI reasoning, or continue using the high-accuracy built-in heuristic engine.'}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Google Gemini API Key</label>
          <input type="password" class="form-input" id="api-key-input" placeholder="Paste your Gemini API key..." value="${escapeHTML(store.getApiKey())}" />
          <span style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.25rem;">
            🔒 Stored securely in your browser local storage. Never transmitted to any third-party server.
          </span>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-primary btn-sm" id="save-api-key-btn">Save Key</button>
          <button class="btn btn-outline btn-sm" id="clear-api-key-btn">Clear Key</button>
        </div>

        <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); font-size: 0.85rem;">
          <strong style="color: var(--text-primary);">Backup & Synchronization:</strong>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0.35rem 0 0.75rem 0;">
            Download all events as a single JSON file for offline archival or transfer.
          </p>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" id="export-json-btn">Export JSON</button>
            <button class="btn btn-danger btn-sm" id="reset-defaults-btn">Reset All</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function openDrawer(tabName = 'blueprint') {
    overlay.classList.add('open');
    drawer.classList.add('open');
    switchTab(tabName);
    const dateInput = drawer.querySelector('#bp-date');
    if (dateInput && !dateInput.value) {
      // Pre-fill with a reasonable default date (e.g. 30 days out), user can change to any day
      const d = new Date(Date.now() + 30 * 86400000);
      dateInput.value = d.toISOString().split('T')[0];
    }
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
  }

  function switchTab(tab) {
    drawer.querySelectorAll('.drawer-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    drawer.querySelectorAll('.drawer-tab-content').forEach(content => {
      content.style.display = content.id === `drawer-tab-${tab}` ? 'flex' : 'none';
    });
  }

  // Listeners
  overlay.addEventListener('click', closeDrawer);
  drawer.querySelector('.close-drawer-btn')?.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('.drawer-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Blueprint Generation
  const bpForm = drawer.querySelector('#blueprint-form');
  const bpLoading = drawer.querySelector('#bp-loading');
  const bpSubmit = drawer.querySelector('#bp-submit-btn');

  bpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    bpSubmit.disabled = true;
    bpLoading.style.display = 'block';

    const chosenDate = drawer.querySelector('#bp-date').value;
    const chosenTime = drawer.querySelector('#bp-time').value || '18:00';

    const params = {
      title: drawer.querySelector('#bp-title').value.trim(),
      type: drawer.querySelector('#bp-type').value,
      currency: drawer.querySelector('#bp-currency').value || 'USD',
      date: chosenDate,
      time: chosenTime,
      totalBudget: Number(drawer.querySelector('#bp-budget').value) || 20000,
      guestCount: Number(drawer.querySelector('#bp-guests').value) || 100,
      vibe: drawer.querySelector('#bp-vibe').value.trim() || 'Unforgettable celebration',
      location: drawer.querySelector('#bp-location').value.trim() || 'Metropolitan Area'
    };

    try {
      const blueprint = await aiService.generateEventBlueprint(params);
      const newEvent = store.addEvent({
        ...params,
        ...blueprint
      });

      bpLoading.style.display = 'none';
      bpSubmit.disabled = false;
      closeDrawer();
      showToast(`Created blueprint for "${newEvent.title}"!`, 'success');
      if (onEventAdded) onEventAdded(newEvent.id);
    } catch (err) {
      bpLoading.style.display = 'none';
      bpSubmit.disabled = false;
      showToast(`Error creating blueprint: ${err.message}`, 'error');
    }
  });

  // Copilot Chat
  const chatInput = drawer.querySelector('#copilot-query-input');
  const chatSend = drawer.querySelector('#copilot-query-send');
  const chatHistory = drawer.querySelector('#copilot-chat-history');

  // Helper to format simple markdown from Gemini
  function formatGeminiResponse(rawText) {
    if (!rawText) return '<p>No response generated.</p>';
    // Escape HTML first for XSS prevention
    const escaped = escapeHTML(rawText);
    
    // Replace headings ###
    let formatted = escaped.replace(/^### (.*$)/gim, '<h4 style="font-size: 0.95rem; color: var(--accent-cyan); margin: 0.4rem 0 0.2rem 0;">$1</h4>');
    // Replace bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>');
    // Replace bullet points
    formatted = formatted.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-bottom: 0.25rem;">$1</li>');
    // Wrap consecutive <li> into <ul>
    formatted = formatted.replace(/(<li[\s\S]*?<\/li>)+/g, '<ul style="padding-left: 1.25rem; margin: 0.4rem 0; color: var(--text-secondary);">$1</ul>');
    // Replace line breaks with paragraph flow
    formatted = formatted.replace(/\n\n+/g, '</p><p style="margin-bottom: 0.4rem; color: var(--text-secondary); line-height: 1.5;">');
    
    return `<div style="line-height: 1.5; color: var(--text-secondary);">${formatted}</div>`;
  }

  async function handleChat(customText = null) {
    const text = (customText || chatInput.value || '').trim();
    if (!text) return;
    if (!customText) chatInput.value = '';

    const userBubble = document.createElement('div');
    userBubble.style.cssText = 'background: var(--accent-primary); color: white; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; align-self: flex-end; max-width: 85%;';
    userBubble.textContent = text;
    chatHistory.appendChild(userBubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const currentEvent = store.getCurrentEvent();

    // Generate intelligent response
    const botBubble = document.createElement('div');
    botBubble.style.cssText = 'background: var(--bg-tertiary); color: var(--text-primary); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; border-left: 3px solid var(--accent-cyan); line-height: 1.5; max-width: 90%;';
    botBubble.innerHTML = '<span class="loading-spinner" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 0.4rem;"></span> Consulting Google Gemini GenAI...';
    chatHistory.appendChild(botBubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const response = await aiService.askCopilot(text, currentEvent);
      botBubble.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.25rem;">
          <strong style="color: var(--accent-cyan); font-size: 0.85rem;">✨ PlanAura Copilot</strong>
          <span style="font-size: 0.7rem; color: var(--text-tertiary);">${store.hasApiKey() ? 'Live Gemini Flash' : 'Built-in Engine'}</span>
        </div>
        ${formatGeminiResponse(response)}
      `;
    } catch (err) {
      botBubble.innerHTML = `
        <strong style="color: var(--accent-rose);">Copilot Notice:</strong>
        <p style="margin-top: 0.25rem; font-size: 0.85rem;">Here is tactical guidance for <em>"${escapeHTML(text)}"</em>: Keep vendor contracts consolidated, establish a dedicated 10% contingency buffer, and preserve clear 30-minute buffers between key timeline milestones.</p>
      `;
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  chatSend?.addEventListener('click', () => handleChat());
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleChat();
  });

  // Connect quick prompt chips
  drawer.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.textContent.replace(/^[^a-zA-Z0-9]+/, '').trim();
      handleChat(query);
    });
  });

  // Settings: API Key Save/Clear
  drawer.querySelector('#save-api-key-btn')?.addEventListener('click', () => {
    const key = drawer.querySelector('#api-key-input').value;
    store.setApiKey(key);
    drawer.querySelector('#ai-engine-status-badge').textContent = store.hasApiKey()
      ? '🟢 Live Gemini API'
      : '⚡ Built-in Expert Engine';
    showToast('Gemini API key updated in session storage', 'success');
  });

  drawer.querySelector('#clear-api-key-btn')?.addEventListener('click', () => {
    store.setApiKey('');
    drawer.querySelector('#api-key-input').value = '';
    drawer.querySelector('#ai-engine-status-badge').textContent = '⚡ Built-in Expert Engine';
    showToast('API key removed. Running on Built-in Expert Engine', 'info');
  });

  // JSON Export & Reset
  drawer.querySelector('#export-json-btn')?.addEventListener('click', () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auraplan_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Exported all event plans to JSON', 'success');
  });

  drawer.querySelector('#reset-defaults-btn')?.addEventListener('click', () => {
    if (confirm('Reset all events back to original templates? Any custom edits will be restored.')) {
      store.resetToDefaults();
      showToast('Reset all events to default templates', 'info');
      closeDrawer();
    }
  });

  drawerInstance = {
    open: openDrawer,
    close: closeDrawer
  };

  return drawerInstance;
}

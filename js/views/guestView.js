/**
 * Guest Well-Being, Accessibility & Inclusion Hub
 */

import { escapeHTML } from '../utils/sanitizer.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderGuestView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  const needs = event.accessibilityNeeds || [];

  function renderContent() {
    return `
      <div class="glass-card" style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3>Accessibility, Inclusion & Guest Well-Being Hub</h3>
            <p style="font-size: 0.85rem;">Ensure seamless physical accessibility, dietary allergy security, and sensory comfort</p>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-ai btn-sm ai-audit-acc-btn">⚡ AI Accessibility Audit</button>
            <button class="btn btn-primary btn-sm add-need-btn">+ Add Requirement</button>
          </div>
        </div>
      </div>

      <!-- Core Inclusion Pillars Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
        <div class="glass-card" style="border-left: 4px solid var(--accent-cyan);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.25rem;">♿</span>
            <h4 style="font-size: 1.05rem; color: var(--text-primary);">Physical Mobility</h4>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Ensure zero-step entry, ramps with 1:12 slope, ADA compliant restrooms, and unobstructed 36-inch minimum pathways.
          </p>
        </div>

        <div class="glass-card" style="border-left: 4px solid var(--accent-emerald);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.25rem;">🥗</span>
            <h4 style="font-size: 1.05rem; color: var(--text-primary);">Dietary & Severe Allergies</h4>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Maintain strict allergen segregation in the kitchen, dedicated gluten-free/peanut-free prep tables, and clear table placards.
          </p>
        </div>

        <div class="glass-card" style="border-left: 4px solid var(--accent-primary);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.25rem;">🎧</span>
            <h4 style="font-size: 1.05rem; color: var(--text-primary);">Sensory & Neurodiversity</h4>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Provide a dedicated quiet decompression lounge with reduced sound, warm non-fluorescent lighting, and sensory tools.
          </p>
        </div>

        <div class="glass-card" style="border-left: 4px solid var(--accent-amber);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.25rem;">🤟</span>
            <h4 style="font-size: 1.05rem; color: var(--text-primary);">Communication & Audio</h4>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Book ASL interpreters for key announcements, high-contrast visual signage, and stage lighting focused on interpreters.
          </p>
        </div>
      </div>

      <!-- Active Requirements Checklist -->
      <div class="glass-card">
        <h3 style="margin-bottom: 1.25rem;">Event Accessibility Safeguards (${needs.length})</h3>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${needs.length === 0 ? `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
              No accessibility requirements logged yet. Click "+ Add Requirement" to safeguard your guests.
            </div>
          ` : needs.map(need => `
            <div style="background: var(--bg-tertiary); padding: 1rem 1.25rem; border-radius: var(--radius-md); border-left: 4px solid ${need.status === 'confirmed' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <strong style="color: var(--text-primary); font-size: 1rem;">${escapeHTML(need.title)}</strong>
                  <span class="badge ${need.status === 'confirmed' ? 'badge-success' : 'badge-neutral'}">
                    ${need.status === 'confirmed' ? '✓ Confirmed' : '○ In Progress'}
                  </span>
                </div>
                ${need.notes ? `
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.5;">
                    ${escapeHTML(need.notes)}
                  </p>
                ` : ''}
              </div>

              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <button class="btn btn-outline btn-sm toggle-need-btn" data-id="${need.id}">
                  ${need.status === 'confirmed' ? 'Mark In Progress' : 'Mark Confirmed'}
                </button>
                <button class="btn btn-danger btn-sm delete-need-btn" data-id="${need.id}" style="padding: 0.25rem 0.5rem;">🗑</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function update() {
    container.innerHTML = renderContent();
    attachListeners();
  }

  function attachListeners() {
    container.querySelector('.add-need-btn')?.addEventListener('click', () => {
      showAddNeedModal(event, store, update);
    });

    container.querySelector('.ai-audit-acc-btn')?.addEventListener('click', () => {
      showAIAccessibilityAuditModal(event, store, aiService, update);
    });

    container.querySelectorAll('.toggle-need-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = event.accessibilityNeeds?.find(n => n.id === id);
        if (item) {
          const newStatus = item.status === 'confirmed' ? 'in-progress' : 'confirmed';
          store.updateAccessibilityNeed(event.id, id, { status: newStatus });
          showToast(`Requirement status updated to ${newStatus}`, 'info');
          update();
        }
      });
    });

    container.querySelectorAll('.delete-need-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.deleteAccessibilityNeed(event.id, id);
        showToast('Requirement removed', 'info');
        update();
      });
    });
  }

  update();
  return container;
}

function showAddNeedModal(event, store, onUpdated) {
  const contentHtml = `
    <form id="add-need-form">
      <div class="form-group">
        <label class="form-label">Requirement Title *</label>
        <input type="text" class="form-input" id="need-title" placeholder="e.g. Reserved Wheelchair Front Row Seating" required />
      </div>

      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="need-status">
          <option value="in-progress">In Progress / Needs Verification</option>
          <option value="confirmed">Confirmed with Venue / Staff</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Operational Action Plan & Notes *</label>
        <textarea class="form-textarea" id="need-notes" placeholder="Specify who is responsible, location, and equipment..." required></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-save-btn">Save Requirement</button>
  `;

  const modal = openModal({
    title: 'Add Accessibility & Inclusion Safeguard',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-save-btn')?.addEventListener('click', () => {
    const form = modal.querySelector('#add-need-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      title: modal.querySelector('#need-title').value.trim(),
      status: modal.querySelector('#need-status').value,
      notes: modal.querySelector('#need-notes').value.trim()
    };

    store.addAccessibilityNeed(event.id, payload);
    showToast(`Added requirement: "${payload.title}"`, 'success');
    closeModal();
    onUpdated();
  });
}

async function showAIAccessibilityAuditModal(event, store, aiService, onUpdated) {
  const contentHtml = `
    <div>
      <div id="ai-audit-loading" style="text-align: center; padding: 2.5rem;">
        <div class="loading-spinner" style="width: 36px; height: 36px; border-width: 3px; border-top-color: var(--accent-emerald);"></div>
        <p style="margin-top: 1rem; color: var(--accent-emerald); font-weight: 700;">Auditing ${escapeHTML(event.title)} with Google Gemini AI...</p>
        <span style="font-size: 0.8rem; color: var(--text-tertiary);">Evaluating physical ADA access, dietary allergies, and sensory comfort</span>
      </div>

      <div id="ai-audit-results" style="display: none; flex-direction: column; gap: 1rem;"></div>
    </div>
  `;

  const footerHtml = `<button class="btn btn-secondary btn-sm modal-close-btn">Done</button>`;

  const modal = openModal({
    title: '⚡ Live GenAI Accessibility & Inclusion Audit',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);

  try {
    const audit = await aiService.auditAccessibility(event);
    const loader = modal.querySelector('#ai-audit-loading');
    const results = modal.querySelector('#ai-audit-results');
    if (!loader || !results) return;

    loader.style.display = 'none';
    results.style.display = 'flex';

    results.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); padding: 1rem; border-radius: var(--radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <strong style="color: var(--accent-emerald); font-size: 1rem;">Accessibility Readiness Score: ${audit.score || 95}/100</strong>
          <span class="badge badge-success">Live AI Verified</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-primary);">${escapeHTML(audit.summary || '')}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${(audit.pillars || []).map(pillar => `
          <div style="background: var(--bg-tertiary); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent-cyan);">
            <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHTML(pillar.title)}</strong>
            <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.35rem; display: flex; flex-direction: column; gap: 0.25rem;">
              ${(pillar.recommendations || []).map(r => `<li>${escapeHTML(r)}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      ${audit.proactiveActionItem ? `
        <div style="margin-top: 0.5rem; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.85rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-primary);">Recommended Action Item:</div>
            <div style="font-size: 0.82rem; color: var(--text-primary); font-weight: 600;">${escapeHTML(audit.proactiveActionItem.title)}</div>
          </div>
          <button class="btn btn-primary btn-sm add-audit-item-btn" style="font-size: 0.78rem;">+ Add to Event</button>
        </div>
      ` : ''}
    `;

    modal.querySelector('.add-audit-item-btn')?.addEventListener('click', (e) => {
      if (audit.proactiveActionItem) {
        store.addAccessibilityNeed(event.id, {
          title: audit.proactiveActionItem.title,
          status: 'in-progress',
          notes: audit.proactiveActionItem.notes || 'Recommended during GenAI Accessibility Audit'
        });
        e.target.textContent = '✓ Added to Requirements';
        e.target.disabled = true;
        showToast(`Added requirement: "${audit.proactiveActionItem.title}"`, 'success');
        if (onUpdated) onUpdated();
      }
    });

  } catch (err) {
    const loader = modal.querySelector('#ai-audit-loading');
    if (loader) {
      loader.innerHTML = `
        <p style="color: var(--accent-rose);">Error running live accessibility audit: ${escapeHTML(err.message)}</p>
      `;
    }
  }
}

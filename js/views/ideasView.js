/**
 * Creative Ideas & Personalization Lab View
 */

import { escapeHTML } from '../utils/sanitizer.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export function renderIdeasView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  const ideas = event.ideas || [];

  function renderContent() {
    return `
      <div class="glass-card" style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3>Creative Ideas & Personalization Lab</h3>
            <p style="font-size: 0.85rem;">Curated themes, signature elements, interactive guest moments, and memorable keepsakes</p>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-ai btn-sm ai-generate-ideas-btn">✨ AI Idea Crafter</button>
            <button class="btn btn-primary btn-sm add-custom-idea-btn">+ Add Custom Idea</button>
          </div>
        </div>
      </div>

      <!-- Current Saved Ideas Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        ${ideas.length === 0 ? `
          <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            No ideas saved yet. Click "✨ AI Idea Crafter" to brainstorm unforgettable touches!
          </div>
        ` : ideas.map(idea => `
          <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span class="badge badge-ai">${escapeHTML(idea.category)}</span>
                <button class="btn btn-danger btn-sm delete-idea-btn" data-id="${idea.id}" style="padding: 0.2rem 0.45rem;">🗑</button>
              </div>
              <h4 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                ${escapeHTML(idea.title)}
              </h4>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
                ${escapeHTML(idea.description)}
              </p>
            </div>
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">Saved for ${escapeHTML(event.title)}</span>
              <span style="color: var(--accent-emerald); font-size: 0.85rem; font-weight: 600;">Active Feature</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function update() {
    container.innerHTML = renderContent();
    attachListeners();
  }

  function attachListeners() {
    container.querySelector('.ai-generate-ideas-btn')?.addEventListener('click', () => {
      showAIIdeasCrafterModal(event, store, aiService, update);
    });

    container.querySelector('.add-custom-idea-btn')?.addEventListener('click', () => {
      showAddCustomIdeaModal(event, store, update);
    });

    container.querySelectorAll('.delete-idea-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        store.deleteIdea(event.id, id);
        showToast('Idea removed', 'info');
        update();
      });
    });
  }

  update();
  return container;
}

function showAIIdeasCrafterModal(event, store, aiService, onUpdated) {
  const contentHtml = `
    <div>
      <div style="margin-bottom: 1rem;">
        <label class="form-label">Theme / Aesthetic Vibe</label>
        <input type="text" class="form-input" id="idea-vibe" value="${escapeHTML(event.vibe || '')}" placeholder="e.g. Modern Rustic Greenhouse, Synthwave Cyberpunk, Harvest Gala..." />
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Budget Tier</label>
          <select class="form-select" id="idea-budget-tier">
            <option value="Economical & DIY">Economical & DIY Friendly</option>
            <option value="Balanced Mid-Range" selected>Balanced Mid-Range</option>
            <option value="Luxury Showstopper">Luxury Showstopper</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Focus Area</label>
          <select class="form-select" id="idea-category-focus">
            <option value="All Categories" selected>All Categories</option>
            <option value="Decor & Atmosphere">Decor & Atmosphere</option>
            <option value="Cocktails & Food">Cocktails & Food Experience</option>
            <option value="Entertainment & Music">Entertainment & Music</option>
            <option value="Guest Keepsakes">Guest Keepsakes</option>
          </select>
        </div>
      </div>

      <button class="btn btn-ai" id="trigger-gen-ideas" style="width: 100%; margin-top: 0.5rem;">
        ✨ Generate 4 Personalized Concepts
      </button>

      <div id="ai-ideas-loading" style="display: none; text-align: center; padding: 2rem;">
        <div class="loading-spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: var(--accent-primary);"></div>
        <p style="margin-top: 1rem; color: var(--accent-primary); font-weight: 600;">Brainstorming tailored concepts...</p>
      </div>

      <div id="ai-ideas-results" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;"></div>
    </div>
  `;

  const footerHtml = `<button class="btn btn-secondary btn-sm modal-close-btn">Close</button>`;

  const modal = openModal({
    title: '✨ GenAI Creative Idea Crafter',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);

  const triggerBtn = modal.querySelector('#trigger-gen-ideas');
  const loadingEl = modal.querySelector('#ai-ideas-loading');
  const resultsEl = modal.querySelector('#ai-ideas-results');

  triggerBtn?.addEventListener('click', async () => {
    const vibe = modal.querySelector('#idea-vibe').value.trim();
    const budgetTier = modal.querySelector('#idea-budget-tier').value;
    const categoryFocus = modal.querySelector('#idea-category-focus').value;

    triggerBtn.disabled = true;
    loadingEl.style.display = 'block';
    resultsEl.innerHTML = '';

    try {
      const generated = await aiService.generatePersonalizedIdeas({
        eventType: event.type,
        vibe,
        guestCount: event.guestCount,
        budgetTier,
        categoryFocus
      });

      loadingEl.style.display = 'none';
      triggerBtn.disabled = false;

      resultsEl.innerHTML = (generated || []).map((idea, idx) => `
        <div style="background: var(--bg-tertiary); border: 1px solid var(--border-card); padding: 1rem; border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
            <span class="badge badge-ai">${escapeHTML(idea.category)}</span>
            <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700;">Cost: ${escapeHTML(idea.estimatedCostTier || '$$')}</span>
          </div>
          <h4 style="font-size: 1rem; color: var(--text-primary); margin-bottom: 0.35rem;">${escapeHTML(idea.title)}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">
            ${escapeHTML(idea.description)}
          </p>
          <button class="btn btn-primary btn-sm save-generated-idea-btn" data-idx="${idx}" style="font-size: 0.8rem;">
            + Save to My Event
          </button>
        </div>
      `).join('');

      resultsEl.querySelectorAll('.save-generated-idea-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const chosen = generated[idx];
          if (chosen) {
            store.addIdea(event.id, chosen);
            btn.textContent = '✓ Saved!';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            btn.disabled = true;
            showToast(`Added "${chosen.title}" to event ideas`, 'success');
            onUpdated();
          }
        });
      });
    } catch (err) {
      loadingEl.style.display = 'none';
      triggerBtn.disabled = false;
      resultsEl.innerHTML = `<p style="color: var(--accent-rose);">Error generating ideas: ${escapeHTML(err.message)}</p>`;
    }
  });
}

function showAddCustomIdeaModal(event, store, onUpdated) {
  const contentHtml = `
    <form id="custom-idea-form">
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="c-idea-category">
          <option value="Decor">Decor & Styling</option>
          <option value="Cocktails">Cocktails & Bar</option>
          <option value="Dining">Dining Experience</option>
          <option value="Entertainment">Entertainment & Games</option>
          <option value="Guest Keepsake">Guest Keepsake / Favors</option>
          <option value="Eco">Eco & Sustainability</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Idea Title *</label>
        <input type="text" class="form-input" id="c-idea-title" placeholder="e.g. Polaroid Vintage Camera Guestbook" required />
      </div>

      <div class="form-group">
        <label class="form-label">Details & Execution *</label>
        <textarea class="form-textarea" id="c-idea-desc" placeholder="Describe the materials, setup, and how guests interact with it..." required></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-save-btn">Save Idea</button>
  `;

  const modal = openModal({
    title: 'Add Custom Creative Idea',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-save-btn')?.addEventListener('click', () => {
    const form = modal.querySelector('#custom-idea-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      category: modal.querySelector('#c-idea-category').value,
      title: modal.querySelector('#c-idea-title').value.trim(),
      description: modal.querySelector('#c-idea-desc').value.trim()
    };

    store.addIdea(event.id, payload);
    showToast(`Saved idea "${payload.title}"`, 'success');
    closeModal();
    onUpdated();
  });
}

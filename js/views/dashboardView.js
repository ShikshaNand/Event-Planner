/**
 * Dashboard Overview View
 * Summarizes critical KPI widgets: countdown ticker, budget utilization, milestone velocity, and vendor counts
 */

import { formatCurrency, formatDate, getDaysRemaining, formatPercentage } from '../utils/formatters.js';
import { escapeHTML } from '../utils/sanitizer.js';

/**
 * Renders the high-level Executive Dashboard
 * @param {import('../state/store.js').Event|null} event - Active event plan
 * @param {import('../state/store.js').EventStore} store - Central store
 * @param {import('../services/aiService.js').AIService} aiService - GenAI service
 * @param {(tab: string) => void} navigateTo - Router navigation function
 * @param {(() => void)} [onEditEvent] - Callback to trigger event edit modal
 * @returns {HTMLElement} Dashboard view DOM element
 */
export function renderDashboardView(event, store, aiService, navigateTo, onEditEvent) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected. Create or select an event to get started.</p></div>`;
    return container;
  }

  const budgetSummary = store.getBudgetSummary(event.id);
  const countdown = getDaysRemaining(event.date);
  const totalMilestones = event.timeline?.length || 0;
  const completedMilestones = event.timeline?.filter(t => t.completed).length || 0;
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const totalVendors = event.vendors?.length || 0;
  const bookedVendors = event.vendors?.filter(v => v.status === 'booked' || v.status === 'paid').length || 0;

  // Next 3 upcoming milestones
  const upcomingTimeline = (event.timeline || [])
    .filter(t => !t.completed)
    .slice(0, 3);

  container.innerHTML = `
    <!-- Top Financial & Progress Stats -->
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Committed Spend</span>
          <span class="stat-icon">💳</span>
        </div>
        <div class="stat-value">${formatCurrency(budgetSummary.effectiveSpend, event.currency)}</div>
        <div class="progress-container" style="margin-top: 0.25rem;">
          <div class="progress-fill ${budgetSummary.isOverBudget ? 'danger' : budgetSummary.percentUsed > 85 ? 'warning' : ''}" style="width: ${budgetSummary.percentUsed}%"></div>
        </div>
        <div class="stat-subtext" style="display: flex; justify-content: space-between; margin-top: 0.25rem;">
          <span>Budget: ${formatCurrency(budgetSummary.totalBudget, event.currency)}</span>
          <span style="font-weight: 700; color: ${budgetSummary.isOverBudget ? 'var(--accent-rose)' : 'var(--text-secondary)'};">
            ${budgetSummary.isOverBudget ? 'Over by ' + formatCurrency(Math.abs(budgetSummary.variance), event.currency) : formatCurrency(budgetSummary.remainingBudget, event.currency) + ' left'}
          </span>
        </div>
      </div>

      <div class="glass-card stat-card" id="dashboard-countdown-card" style="cursor: pointer; transition: transform var(--transition-fast);" title="Click to change event date & countdown">
        <div class="stat-header">
          <span class="stat-label">Countdown</span>
          <span class="stat-icon" title="Edit Date">📅 ⏳</span>
        </div>
        <div class="stat-value" style="color: var(--accent-cyan);">${countdown.label}</div>
        <div class="stat-subtext" style="display: flex; justify-content: space-between; align-items: center;">
          <span>${formatDate(event.date)} at ${escapeHTML(event.time || '18:00')}</span>
          <span style="font-size: 0.72rem; color: var(--accent-primary); font-weight: 700; text-decoration: underline;">Change Date</span>
        </div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Run-of-Show Readiness</span>
          <span class="stat-icon">⏱</span>
        </div>
        <div class="stat-value">${completedMilestones} / ${totalMilestones}</div>
        <div class="progress-container" style="margin-top: 0.25rem;">
          <div class="progress-fill" style="width: ${milestonePercent}%; background: var(--accent-emerald);"></div>
        </div>
        <div class="stat-subtext">${milestonePercent}% checkpoints completed</div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Vendor Procurement</span>
          <span class="stat-icon">🤝</span>
        </div>
        <div class="stat-value" style="color: var(--accent-amber);">${bookedVendors} / ${totalVendors}</div>
        <div class="stat-subtext">${totalVendors - bookedVendors} vendors in negotiation</div>
      </div>
    </div>

    <!-- Grid Layout: Identity & Quick Problem Solving -->
    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; margin-bottom: 2rem;">
      <!-- Event Identity & Vibe Panel -->
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🎨</span> Creative Vision & Vibe Blueprint
          </h3>
          <span class="badge badge-${event.type}">${event.type}</span>
        </div>
        <p style="font-size: 1.05rem; color: var(--text-primary); font-weight: 500; margin-bottom: 1rem; line-height: 1.6;">
          "${escapeHTML(event.vibe || 'An extraordinary gathering curated with style and purpose.')}"
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Curated Color Palette:</span>
            <div class="palette-container">
              ${(event.colorPalette || []).map(hex => `
                <div class="palette-swatch" style="background-color: ${escapeHTML(hex)};" title="${escapeHTML(hex)}"></div>
              `).join('')}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span style="color: var(--text-secondary);">Venue / Setting:</span>
            <span style="font-weight: 600; color: var(--text-primary);">${escapeHTML(event.location || 'Location TBD')}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
            <span style="color: var(--text-secondary);">Expected Attendance:</span>
            <span style="font-weight: 600; color: var(--text-primary);">${event.guestCount || 0} Guests</span>
          </div>
        </div>

        <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm explore-ideas-cta">✨ Explore Creative Ideas</button>
          <button class="btn btn-outline btn-sm view-budget-cta">📊 Open Financial Ledger</button>
        </div>
      </div>

      <!-- Emergency & Crisis Preparedness Card -->
      <div class="glass-card" style="border-color: rgba(244, 63, 94, 0.3); background: linear-gradient(180deg, rgba(244, 63, 94, 0.05) 0%, var(--bg-card) 100%);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
          <h3 style="color: var(--accent-rose); display: flex; align-items: center; gap: 0.5rem;">
            <span>🛡️</span> Crisis Shield
          </h3>
          <span class="badge badge-danger">Ready</span>
        </div>
        <p style="font-size: 0.88rem; margin-bottom: 1rem;">
          Instant GenAI contingency playbooks for weather shifts, caterer cancellations, sound failures, or guest medical emergencies.
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
            Contingency Buffer Recommendation
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            Allocated: <strong style="color: var(--accent-emerald);">${formatCurrency(event.budgetItems?.find(b => b.category.includes('Contingency'))?.estimatedCost || 0, event.currency)}</strong>
            (${Math.round(((event.budgetItems?.find(b => b.category.includes('Contingency'))?.estimatedCost || 0) / (event.totalBudget || 1)) * 100)}% of total budget)
          </div>
        </div>

        <button class="btn btn-danger open-crisis-cta" style="width: 100%;">
          🚨 Open Emergency Crisis Solver
        </button>
      </div>
    </div>

    <!-- Upcoming Milestones Run-of-Show Preview -->
    <div class="glass-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">
          <span>⏱</span> Run-of-Show Key Checkpoints
        </h3>
        <button class="btn btn-outline btn-sm view-timeline-cta">View Full Timeline (${totalMilestones}) →</button>
      </div>

      ${upcomingTimeline.length === 0 ? `
        <p style="color: var(--text-secondary); padding: 1rem 0;">All milestones for this event have been completed! 🎉</p>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${upcomingTimeline.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 0.85rem 1.25rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent-cyan);">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem;">${escapeHTML(item.time)}</span>
                  <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHTML(item.title)}</strong>
                </div>
                ${item.description ? `<p style="font-size: 0.82rem; margin-top: 0.2rem; color: var(--text-secondary);">${escapeHTML(item.description)}</p>` : ''}
              </div>
              <span class="badge badge-neutral">${escapeHTML(item.assignee || 'Staff')}</span>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  // Event Listeners for CTAs
  container.querySelector('.explore-ideas-cta')?.addEventListener('click', () => navigateTo('ideas'));
  container.querySelector('.view-budget-cta')?.addEventListener('click', () => navigateTo('budget'));
  container.querySelector('.open-crisis-cta')?.addEventListener('click', () => navigateTo('crisis'));
  container.querySelector('.view-timeline-cta')?.addEventListener('click', () => navigateTo('timeline'));
  container.querySelector('#dashboard-countdown-card')?.addEventListener('click', () => {
    if (onEditEvent) onEditEvent();
  });

  return container;
}

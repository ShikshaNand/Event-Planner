/**
 * Comprehensive Budget & Financial Ledger View
 * Provides visual analytics, progress bars, line item CRUD, CSV export, and AI optimization
 */

import { formatCurrency, getCurrencySymbol } from '../utils/formatters.js';
import { escapeHTML } from '../utils/sanitizer.js';
import { validateBudgetItem } from '../utils/validators.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { exportBudgetCSV } from '../services/exportService.js';

/**
 * Renders the primary Budget & Expense Tracker view
 * @param {import('../state/store.js').Event|null} event - Currently active event
 * @param {import('../state/store.js').EventStore} store - Central event store
 * @param {import('../services/aiService.js').AIService} aiService - GenAI service
 * @returns {HTMLElement} Container DOM element with interactive financial ledger
 */
export function renderBudgetView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  const summary = store.getBudgetSummary(event.id);
  const items = event.budgetItems || [];

  container.innerHTML = `
    <!-- Top Summary Banner -->
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Budget Target</span>
          <span class="stat-icon">🎯</span>
        </div>
        <div class="stat-value">${formatCurrency(summary.totalBudget, event.currency)}</div>
        <div class="stat-subtext">Overall event ceiling</div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Committed / Actual Spend</span>
          <span class="stat-icon">💸</span>
        </div>
        <div class="stat-value" style="color: ${summary.isOverBudget ? 'var(--accent-rose)' : 'var(--text-primary)'};">
          ${formatCurrency(summary.effectiveSpend, event.currency)}
        </div>
        <div class="progress-container" style="margin-top: 0.25rem;">
          <div class="progress-fill ${summary.isOverBudget ? 'danger' : summary.percentUsed > 85 ? 'warning' : ''}" style="width: ${summary.percentUsed}%"></div>
        </div>
        <div class="stat-subtext">${summary.percentUsed}% utilized</div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Remaining Balance</span>
          <span class="stat-icon">⚖️</span>
        </div>
        <div class="stat-value" style="color: ${summary.isOverBudget ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">
          ${summary.isOverBudget ? '-' + formatCurrency(Math.abs(summary.variance), event.currency) : formatCurrency(summary.remainingBudget, event.currency)}
        </div>
        <div class="stat-subtext">${summary.isOverBudget ? '⚠️ Budget overrun alert' : 'Remaining available fund'}</div>
      </div>

      <div class="glass-card stat-card">
        <div class="stat-header">
          <span class="stat-label">Settled / Paid to Date</span>
          <span class="stat-icon">✅</span>
        </div>
        <div class="stat-value" style="color: var(--accent-cyan);">${formatCurrency(summary.totalPaid, event.currency)}</div>
        <div class="stat-subtext">${formatCurrency(summary.effectiveSpend - summary.totalPaid, event.currency)} pending payment</div>
      </div>
    </div>

    <!-- Category Allocation Bar -->
    <div class="glass-card" style="margin-bottom: 2rem;">
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; justify-content: space-between;">
        <span>📊 Category Allocation Breakdown</span>
        <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">${Object.keys(summary.categoryBreakdown).length} active categories</span>
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
        ${Object.entries(summary.categoryBreakdown).map(([category, data]) => `
          <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent-primary);">
            <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">${escapeHTML(category)}</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${formatCurrency(data.actual > 0 ? data.actual : data.estimated, event.currency)}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">
              ${data.count} line items • Paid: ${formatCurrency(data.paid, event.currency)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Action Toolbar & Ledger Table -->
    <div class="glass-card">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h3>Financial Ledger & Expense Items</h3>
          <p style="font-size: 0.85rem;">Track quotes, contracts, paid deposits, and actual invoices</p>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm export-csv-btn">📥 Export to CSV</button>
          <button class="btn btn-ai btn-sm optimize-budget-btn">⚡ AI Cost Optimizer</button>
          <button class="btn btn-primary btn-sm add-expense-btn">+ Add Line Item</button>
        </div>
      </div>

      <!-- Ledger Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Estimated</th>
              <th>Actual / Final</th>
              <th>Paid</th>
              <th>Payment Status</th>
              <th>Notes</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                  No budget items added yet. Click "+ Add Line Item" or run the AI Assistant!
                </td>
              </tr>
            ` : items.map(item => `
              <tr data-item-id="${item.id}">
                <td><span class="badge badge-neutral">${escapeHTML(item.category)}</span></td>
                <td><strong>${escapeHTML(item.name)}</strong></td>
                <td>${formatCurrency(item.estimatedCost, event.currency)}</td>
                <td style="font-weight: 700; color: ${item.actualCost > item.estimatedCost ? 'var(--accent-rose)' : 'var(--text-primary)'};">
                  ${formatCurrency(item.actualCost, event.currency)}
                </td>
                <td style="color: var(--accent-emerald);">${formatCurrency(item.paidCost, event.currency)}</td>
                <td>
                  <span class="badge ${item.status === 'paid' ? 'badge-success' : item.status === 'deposit_paid' ? 'badge-ai' : 'badge-neutral'}">
                    ${escapeHTML((item.status || 'pending').replace('_', ' '))}
                  </span>
                </td>
                <td style="max-width: 220px; font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(item.notes || '')}">
                  ${escapeHTML(item.notes || '-')}
                </td>
                <td style="text-align: right; white-space: nowrap;">
                  <button class="btn btn-outline btn-sm edit-item-btn" data-id="${item.id}" title="Edit" style="padding: 0.25rem 0.5rem;">✏️</button>
                  <button class="btn btn-danger btn-sm delete-item-btn" data-id="${item.id}" title="Delete" style="padding: 0.25rem 0.5rem;">🗑</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Listeners
  container.querySelector('.export-csv-btn')?.addEventListener('click', () => {
    exportBudgetCSV(event);
    showToast('Budget exported to CSV successfully!', 'success');
  });

  container.querySelector('.add-expense-btn')?.addEventListener('click', () => {
    showAddExpenseModal(event, store);
  });

  container.querySelectorAll('.edit-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = items.find(i => i.id === id);
      if (item) showEditExpenseModal(event, store, item);
    });
  });

  container.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this expense line item?')) {
        store.deleteBudgetItem(event.id, id);
        showToast('Expense item deleted', 'info');
      }
    });
  });

  container.querySelector('.optimize-budget-btn')?.addEventListener('click', () => {
    showAIBudgetOptimizerModal(event, store, aiService);
  });

  return container;
}

/**
 * Displays modal to add a new budget item
 * @param {import('../state/store.js').Event} event 
 * @param {import('../state/store.js').EventStore} store 
 */
function showAddExpenseModal(event, store) {
  const contentHtml = `
    <form id="add-expense-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-select" id="exp-category" required>
            <option value="Venue">Venue</option>
            <option value="Catering">Catering & Bar</option>
            <option value="Photography & Film">Photography & Film</option>
            <option value="Florals & Decor">Florals & Decor</option>
            <option value="Music & Entertainment">Music & Entertainment</option>
            <option value="Attire & Beauty">Attire & Beauty</option>
            <option value="Permits & Logistics">Permits & Logistics</option>
            <option value="Contingency Reserve">Contingency Reserve</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Description / Item Name *</label>
          <input type="text" class="form-input" id="exp-name" placeholder="e.g. Wedding Cake 3-Tier" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Estimated Cost ($) *</label>
          <input type="number" class="form-input" id="exp-estimated" min="0" step="1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Actual / Invoiced Cost ($)</label>
          <input type="number" class="form-input" id="exp-actual" min="0" step="1" placeholder="0" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Amount Paid to Date ($)</label>
          <input type="number" class="form-input" id="exp-paid" min="0" step="1" placeholder="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Payment Status</label>
          <select class="form-select" id="exp-status">
            <option value="pending">Pending</option>
            <option value="deposit_paid">Deposit Paid</option>
            <option value="paid">Paid in Full</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notes & Vendor Details</label>
        <textarea class="form-textarea" id="exp-notes" placeholder="Contract milestone, invoice #, terms..."></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-save-btn">Save Line Item</button>
  `;

  const modal = openModal({
    title: 'Add Budget Expense Line Item',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-save-btn')?.addEventListener('click', () => {
    const form = modal.querySelector('#add-expense-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      category: modal.querySelector('#exp-category').value,
      name: modal.querySelector('#exp-name').value,
      estimatedCost: Number(modal.querySelector('#exp-estimated').value) || 0,
      actualCost: Number(modal.querySelector('#exp-actual').value) || 0,
      paidCost: Number(modal.querySelector('#exp-paid').value) || 0,
      status: modal.querySelector('#exp-status').value,
      notes: modal.querySelector('#exp-notes').value
    };

    const validation = validateBudgetItem(payload);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    store.addBudgetItem(event.id, payload);
    showToast(`Added "${payload.name}" to budget`, 'success');
    closeModal();
  });
}

/**
 * Displays modal to edit an existing budget item
 * @param {import('../state/store.js').Event} event 
 * @param {import('../state/store.js').EventStore} store 
 * @param {import('../state/store.js').BudgetItem} item 
 */
function showEditExpenseModal(event, store, item) {
  const contentHtml = `
    <form id="edit-expense-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Category *</label>
          <input type="text" class="form-input" id="edit-category" value="${escapeHTML(item.category)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description / Item Name *</label>
          <input type="text" class="form-input" id="edit-name" value="${escapeHTML(item.name)}" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Estimated Cost ($) *</label>
          <input type="number" class="form-input" id="edit-estimated" value="${item.estimatedCost}" min="0" required />
        </div>
        <div class="form-group">
          <label class="form-label">Actual Cost ($)</label>
          <input type="number" class="form-input" id="edit-actual" value="${item.actualCost}" min="0" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Paid to Date ($)</label>
          <input type="number" class="form-input" id="edit-paid" value="${item.paidCost}" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Payment Status</label>
          <select class="form-select" id="edit-status">
            <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="deposit_paid" ${item.status === 'deposit_paid' ? 'selected' : ''}>Deposit Paid</option>
            <option value="paid" ${item.status === 'paid' ? 'selected' : ''}>Paid in Full</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="edit-notes">${escapeHTML(item.notes || '')}</textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-update-btn">Update Line Item</button>
  `;

  const modal = openModal({
    title: `Edit Line Item: ${escapeHTML(item.name)}`,
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-update-btn')?.addEventListener('click', () => {
    store.updateBudgetItem(event.id, item.id, {
      category: modal.querySelector('#edit-category').value,
      name: modal.querySelector('#edit-name').value,
      estimatedCost: Number(modal.querySelector('#edit-estimated').value),
      actualCost: Number(modal.querySelector('#edit-actual').value),
      paidCost: Number(modal.querySelector('#edit-paid').value),
      status: modal.querySelector('#edit-status').value,
      notes: modal.querySelector('#edit-notes').value
    });
    showToast('Expense updated', 'success');
    closeModal();
  });
}

/**
 * Opens AI Smart Budget Optimizer modal with recommendations and negotiation levers
 * @param {import('../state/store.js').Event} event 
 * @param {import('../state/store.js').EventStore} store 
 * @param {import('../services/aiService.js').AIService} aiService 
 * @returns {Promise<void>}
 */
async function showAIBudgetOptimizerModal(event, store, aiService) {
  const summary = store.getBudgetSummary(event.id);

  const contentHtml = `
    <div>
      <p style="margin-bottom: 1rem;">
        PlanAura's GenAI analyzes your line items against current industry benchmarks to identify waste, propose high-impact substitutions, and suggest negotiation levers.
      </p>
      
      <div id="ai-opt-loading" style="text-align: center; padding: 2rem;">
        <div class="loading-spinner" style="width: 32px; height: 32px; border-width: 3px; border-top-color: var(--accent-primary);"></div>
        <p style="margin-top: 1rem; color: var(--accent-primary); font-weight: 600;">Analyzing financial footprint and cost drivers...</p>
      </div>

      <div id="ai-opt-results" style="display: none; flex-direction: column; gap: 1.25rem;"></div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-close-btn">Close</button>
  `;

  const modal = openModal({
    title: '⚡ GenAI Smart Budget Optimizer',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);

  try {
    const analysis = await aiService.optimizeBudget({
      totalBudget: summary.totalBudget,
      effectiveSpend: summary.effectiveSpend,
      budgetItems: event.budgetItems || [],
      eventType: event.type,
      savingsGoal: Math.round(summary.totalBudget * 0.12)
    });

    const loader = modal.querySelector('#ai-opt-loading');
    const results = modal.querySelector('#ai-opt-results');
    if (!loader || !results) return;

    loader.style.display = 'none';
    results.style.display = 'flex';

    results.innerHTML = `
      <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); padding: 1rem; border-radius: var(--radius-md);">
        <strong style="color: var(--text-accent); font-size: 0.95rem;">Advisor Assessment:</strong>
        <p style="font-size: 0.9rem; color: var(--text-primary); margin-top: 0.25rem;">${escapeHTML(analysis.overallVerdict)}</p>
        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          Projected Optimized Spend: <strong style="color: var(--accent-emerald); font-size: 1rem;">${formatCurrency(analysis.projectedNewTotal, event.currency)}</strong>
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 0.75rem; color: var(--text-primary); font-size: 1rem;">High-Impact Cost Reduction Levers:</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${(analysis.recommendedCuts || []).map(cut => `
            <div style="background: var(--bg-tertiary); padding: 0.85rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent-amber);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--text-primary);">${escapeHTML(cut.item)} (${escapeHTML(cut.category)})</strong>
                <span class="badge badge-success">Save ~${formatCurrency(cut.estimatedSavings, event.currency)}</span>
              </div>
              <p style="font-size: 0.85rem; margin-top: 0.3rem; color: var(--text-secondary);">${escapeHTML(cut.strategy)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1rem;">Vendor Negotiation Secrets:</h4>
        <ul style="padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
          ${(analysis.vendorNegotiationTips || []).map(tip => `<li>${escapeHTML(tip)}</li>`).join('')}
        </ul>
      </div>
    `;
  } catch (err) {
    const loader = modal.querySelector('#ai-opt-loading');
    if (loader) {
      loader.innerHTML = `<p style="color: var(--accent-rose);">Failed to optimize budget: ${escapeHTML(err.message)}</p>`;
    }
  }
}

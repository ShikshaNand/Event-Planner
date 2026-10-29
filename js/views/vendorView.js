/**
 * Vendor Procurement & RFP Checklist View
 * Manages vendor contacts, contract signing, insurance verification (COI), and contingency backup plans
 */

import { formatCurrency } from '../utils/formatters.js';
import { escapeHTML } from '../utils/sanitizer.js';
import { validateVendor } from '../utils/validators.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

/**
 * Renders the Vendor Procurement & RFP View
 * @param {import('../state/store.js').Event|null} event - Active event plan
 * @param {import('../state/store.js').EventStore} store - Central event store
 * @param {import('../services/aiService.js').AIService} aiService - GenAI service
 * @returns {HTMLElement} Vendor view container DOM element
 */
export function renderVendorView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  const vendors = event.vendors || [];

  container.innerHTML = `
    <div class="glass-card" style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3>Vendor Procurement & RFP Checklist</h3>
          <p style="font-size: 0.85rem;">Contracts, insurance COIs, payment balances, and contingency backup plans</p>
        </div>
        <div style="display: flex; gap: 0.6rem;">
          <button class="btn btn-outline btn-sm ai-vendor-rfp-btn">📋 AI Vendor Interview Questions</button>
          <button class="btn btn-primary btn-sm add-vendor-btn">+ Add Vendor</button>
        </div>
      </div>
    </div>

    <!-- Vendor Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
      ${vendors.length === 0 ? `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          No vendors added yet. Click "+ Add Vendor" to add your venue, caterer, photographer, or entertainment!
        </div>
      ` : vendors.map(v => `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem;">
              <div>
                <h4 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 0.2rem;">${escapeHTML(v.name)}</h4>
                <span class="badge badge-neutral">${escapeHTML(v.category)}</span>
              </div>
              <span class="badge ${v.status === 'booked' || v.status === 'paid' ? 'badge-success' : 'badge-neutral'}">
                ${escapeHTML(v.status)}
              </span>
            </div>

            <!-- Contact Details -->
            <div style="background: var(--bg-tertiary); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.35rem;">
              ${v.contactPerson ? `<div>👤 <strong>Contact:</strong> ${escapeHTML(v.contactPerson)}</div>` : ''}
              ${v.email ? `<div>✉️ <strong>Email:</strong> <a href="mailto:${escapeHTML(v.email)}">${escapeHTML(v.email)}</a></div>` : ''}
              ${v.phone ? `<div>📞 <strong>Phone:</strong> <a href="tel:${escapeHTML(v.phone)}">${escapeHTML(v.phone)}</a></div>` : ''}
            </div>

            <!-- Compliance Badges -->
            <div style="display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap;">
              <span class="badge ${v.contractSigned ? 'badge-success' : 'badge-neutral'}">
                ${v.contractSigned ? '✓ Contract Signed' : '○ Pending Contract'}
              </span>
              <span class="badge ${v.insuranceVerified ? 'badge-success' : 'badge-neutral'}">
                ${v.insuranceVerified ? '✓ COI Verified' : '○ Needs COI'}
              </span>
            </div>

            <!-- Notes -->
            ${v.notes ? `
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.85rem; line-height: 1.4;">
                <strong>Requirements:</strong> ${escapeHTML(v.notes)}
              </div>
            ` : ''}

            <!-- Contingency Backup Plan Highlight -->
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); font-size: 0.82rem; margin-bottom: 1rem;">
              <strong style="color: var(--accent-amber);">🛡️ Contingency / Backup Plan:</strong>
              <div style="color: var(--text-primary); margin-top: 0.2rem;">
                ${escapeHTML(v.backupPlan || 'No backup vendor designated yet. Add one to safeguard against cancellations.')}
              </div>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; margin-top: 0.5rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-tertiary);">Total Fee</div>
              <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${formatCurrency(v.cost, event.currency)}</div>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-outline btn-sm edit-vendor-btn" data-id="${v.id}">✏️ Edit</button>
              <button class="btn btn-danger btn-sm delete-vendor-btn" data-id="${v.id}">🗑</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Listeners
  container.querySelector('.add-vendor-btn')?.addEventListener('click', () => {
    showAddVendorModal(event, store);
  });

  container.querySelector('.ai-vendor-rfp-btn')?.addEventListener('click', () => {
    showVendorRFPQuestionsModal(event);
  });

  container.querySelectorAll('.edit-vendor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const vendor = vendors.find(v => v.id === id);
      if (vendor) showEditVendorModal(event, store, vendor);
    });
  });

  container.querySelectorAll('.delete-vendor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this vendor record?')) {
        store.deleteVendor(event.id, id);
        showToast('Vendor removed', 'info');
      }
    });
  });

  return container;
}

function showAddVendorModal(event, store) {
  const contentHtml = `
    <form id="add-vendor-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Vendor Company Name *</label>
          <input type="text" class="form-input" id="v-name" placeholder="e.g. Lumina Sounds & Lighting" required />
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select class="form-select" id="v-category" required>
            <option value="Venue">Venue</option>
            <option value="Catering">Catering & Bar</option>
            <option value="Photography">Photography & Videography</option>
            <option value="Florals">Florals & Greenery</option>
            <option value="Music">DJ & Music</option>
            <option value="AV & Staging">AV, Lighting & Staging</option>
            <option value="Transportation">Transportation & Shuttles</option>
            <option value="Logistics">Permits & Logistics</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <input type="text" class="form-input" id="v-contact" placeholder="e.g. Sarah Jenkins" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-input" id="v-phone" placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="v-email" placeholder="contact@vendor.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Procurement Status</label>
          <select class="form-select" id="v-status">
            <option value="researching">Researching / Comparing</option>
            <option value="contacted">Contacted / RFP Sent</option>
            <option value="quoted">Proposal Received</option>
            <option value="booked" selected>Booked / Deposit Paid</option>
            <option value="paid">Fully Settled</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Agreed Contract Price ($)</label>
          <input type="number" class="form-input" id="v-cost" placeholder="0" min="0" />
        </div>
        <div class="form-group" style="justify-content: center; gap: 0.5rem; padding-top: 1.25rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer;">
            <input type="checkbox" id="v-contract" /> Contract Signed
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer;">
            <input type="checkbox" id="v-coi" /> Insurance (COI) on File
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">🛡️ Contingency / Backup Plan (Critical Problem Solver)</label>
        <input type="text" class="form-input" id="v-backup" placeholder="e.g. Associate shooter on standby; sister commissary kitchen in next town" />
      </div>

      <div class="form-group">
        <label class="form-label">Contract Deliverables & Riders</label>
        <textarea class="form-textarea" id="v-notes" placeholder="Power requirements, meal breaks, load-in times, curfew..."></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-save-btn">Save Vendor</button>
  `;

  const modal = openModal({
    title: 'Add Vendor to Event',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-save-btn')?.addEventListener('click', () => {
    const form = modal.querySelector('#add-vendor-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: modal.querySelector('#v-name').value.trim(),
      category: modal.querySelector('#v-category').value,
      contactPerson: modal.querySelector('#v-contact').value.trim(),
      phone: modal.querySelector('#v-phone').value.trim(),
      email: modal.querySelector('#v-email').value.trim(),
      status: modal.querySelector('#v-status').value,
      cost: Number(modal.querySelector('#v-cost').value) || 0,
      contractSigned: modal.querySelector('#v-contract').checked,
      insuranceVerified: modal.querySelector('#v-coi').checked,
      backupPlan: modal.querySelector('#v-backup').value.trim(),
      notes: modal.querySelector('#v-notes').value.trim()
    };

    const validation = validateVendor(payload);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    store.addVendor(event.id, payload);
    showToast(`Added vendor "${payload.name}"`, 'success');
    closeModal();
  });
}

function showEditVendorModal(event, store, vendor) {
  const contentHtml = `
    <form id="edit-vendor-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Company Name *</label>
          <input type="text" class="form-input" id="edit-v-name" value="${escapeHTML(vendor.name)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <input type="text" class="form-input" id="edit-v-category" value="${escapeHTML(vendor.category)}" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Contact Person</label>
          <input type="text" class="form-input" id="edit-v-contact" value="${escapeHTML(vendor.contactPerson || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-input" id="edit-v-phone" value="${escapeHTML(vendor.phone || '')}" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="edit-v-email" value="${escapeHTML(vendor.email || '')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="edit-v-status">
            <option value="researching" ${vendor.status === 'researching' ? 'selected' : ''}>Researching</option>
            <option value="contacted" ${vendor.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="quoted" ${vendor.status === 'quoted' ? 'selected' : ''}>Quoted</option>
            <option value="booked" ${vendor.status === 'booked' ? 'selected' : ''}>Booked</option>
            <option value="paid" ${vendor.status === 'paid' ? 'selected' : ''}>Paid</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Agreed Cost ($)</label>
          <input type="number" class="form-input" id="edit-v-cost" value="${vendor.cost || 0}" min="0" />
        </div>
        <div class="form-group" style="justify-content: center; gap: 0.5rem; padding-top: 1.25rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer;">
            <input type="checkbox" id="edit-v-contract" ${vendor.contractSigned ? 'checked' : ''} /> Contract Signed
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; cursor: pointer;">
            <input type="checkbox" id="edit-v-coi" ${vendor.insuranceVerified ? 'checked' : ''} /> Insurance (COI) on File
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">🛡️ Contingency / Backup Plan</label>
        <input type="text" class="form-input" id="edit-v-backup" value="${escapeHTML(vendor.backupPlan || '')}" />
      </div>

      <div class="form-group">
        <label class="form-label">Deliverables & Notes</label>
        <textarea class="form-textarea" id="edit-v-notes">${escapeHTML(vendor.notes || '')}</textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-update-btn">Update Vendor</button>
  `;

  const modal = openModal({
    title: 'Edit Vendor Details',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-update-btn')?.addEventListener('click', () => {
    store.updateVendor(event.id, vendor.id, {
      name: modal.querySelector('#edit-v-name').value.trim(),
      category: modal.querySelector('#edit-v-category').value.trim(),
      contactPerson: modal.querySelector('#edit-v-contact').value.trim(),
      phone: modal.querySelector('#edit-v-phone').value.trim(),
      email: modal.querySelector('#edit-v-email').value.trim(),
      status: modal.querySelector('#edit-v-status').value,
      cost: Number(modal.querySelector('#edit-v-cost').value) || 0,
      contractSigned: modal.querySelector('#edit-v-contract').checked,
      insuranceVerified: modal.querySelector('#edit-v-coi').checked,
      backupPlan: modal.querySelector('#edit-v-backup').value.trim(),
      notes: modal.querySelector('#edit-v-notes').value.trim()
    });
    showToast('Vendor profile updated', 'success');
    closeModal();
  });
}

function showVendorRFPQuestionsModal(event) {
  const contentHtml = `
    <div>
      <p style="margin-bottom: 1rem;">
        Essential questions vetted by top event directors to protect your deposit, ensure accountability, and prevent day-of surprises for your <strong>${escapeHTML(event.type)}</strong>:
      </p>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-cyan);">1. Cancellation & Replacement Policy:</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
            "If your primary lead falls ill or has an emergency, who is the designated backup and what are their qualifications?"
          </p>
        </div>

        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-cyan);">2. Overtime & Hidden Fees:</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
            "What is your exact hourly rate if the event runs 30-60 minutes late? Are travel fees, cake cutting, or equipment breakdown fees included?"
          </p>
        </div>

        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-cyan);">3. Power & Venue Setup Requirements:</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
            "How many dedicated 20A circuits do you require? How many hours before guest arrival do you need uninterrupted access?"
          </p>
        </div>

        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-cyan);">4. Liability & Insurance:</strong>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
            "Can you provide a $1,000,000 Certificate of Insurance (COI) naming our venue as additionally insured at least 30 days prior?"
          </p>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `<button class="btn btn-secondary btn-sm modal-close-btn">Done</button>`;

  const modal = openModal({
    title: '📋 Vendor Interview & RFP Safeguards',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
}

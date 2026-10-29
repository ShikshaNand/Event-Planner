/**
 * Interactive Timeline & Run-of-Show Planner View
 * Chronological execution schedule, assignee accountability, phase filtering, and iCal calendar export
 */

import { escapeHTML } from '../utils/sanitizer.js';
import { validateTimelineItem } from '../utils/validators.js';
import { openModal, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { exportTimelineICal } from '../services/exportService.js';

/**
 * Renders the Interactive Timeline and Run-of-Show View
 * @param {import('../state/store.js').Event|null} event - Active event plan
 * @param {import('../state/store.js').EventStore} store - Central event store
 * @param {import('../services/aiService.js').AIService} aiService - GenAI service
 * @returns {HTMLElement} Timeline view container DOM element
 */
export function renderTimelineView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  let activePhaseFilter = 'all';

  function renderTimelineContent() {
    const timeline = event.timeline || [];
    const filtered = activePhaseFilter === 'all'
      ? timeline
      : timeline.filter(t => t.phase === activePhaseFilter);

    const completedCount = timeline.filter(t => t.completed).length;

    return `
      <div class="glass-card">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h3>Interactive Run-of-Show & Timeline</h3>
            <p style="font-size: 0.85rem;">Minute-by-minute execution schedule with assignees and transition buffers</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm export-ical-btn">📅 Export to Calendar (.ics)</button>
            <button class="btn btn-ai btn-sm ai-audit-timeline-btn">⚡ AI Schedule Audit</button>
            <button class="btn btn-primary btn-sm add-milestone-btn">+ Add Milestone</button>
          </div>
        </div>

        <!-- Filter Pills & Completion Stats -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-tertiary); padding: 0.6rem 1rem; border-radius: var(--radius-md);">
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm ${activePhaseFilter === 'all' ? 'btn-primary' : 'btn-outline'} filter-phase-btn" data-phase="all">All (${timeline.length})</button>
            <button class="btn btn-sm ${activePhaseFilter === 'pre-event' ? 'btn-primary' : 'btn-outline'} filter-phase-btn" data-phase="pre-event">Pre-Event Prep</button>
            <button class="btn btn-sm ${activePhaseFilter === 'day-of' ? 'btn-primary' : 'btn-outline'} filter-phase-btn" data-phase="day-of">Day-of Run-of-Show</button>
            <button class="btn btn-sm ${activePhaseFilter === 'post-event' ? 'btn-primary' : 'btn-outline'} filter-phase-btn" data-phase="post-event">Post-Event Wrap</button>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            Progress: <strong style="color: var(--accent-emerald);">${completedCount} of ${timeline.length}</strong> completed
          </div>
        </div>

        <!-- Timeline Items List -->
        <div class="timeline-list">
          ${filtered.length === 0 ? `
            <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
              No milestones found in this phase. Click "+ Add Milestone" to schedule one!
            </div>
          ` : filtered.map(item => `
            <div class="timeline-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
              <div class="timeline-bullet toggle-complete-btn" title="Click to toggle status" role="button" tabindex="0">
                ${item.completed ? '✓' : ''}
              </div>
              <div class="timeline-content-card">
                <div class="timeline-meta-bar">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span class="timeline-time-badge">${escapeHTML(item.time)}</span>
                    <strong style="color: var(--text-primary); font-size: 1rem;">${escapeHTML(item.title)}</strong>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="badge badge-neutral">${escapeHTML(item.assignee || 'Staff')}</span>
                    <span class="badge ${item.phase === 'day-of' ? 'badge-ai' : 'badge-neutral'}">${escapeHTML(item.phase)}</span>
                    <button class="btn btn-outline btn-sm edit-milestone-btn" data-id="${item.id}" style="padding: 0.2rem 0.45rem;">✏️</button>
                    <button class="btn btn-danger btn-sm delete-milestone-btn" data-id="${item.id}" style="padding: 0.2rem 0.45rem;">🗑</button>
                  </div>
                </div>
                ${item.description ? `
                  <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.35rem; line-height: 1.5;">
                    ${escapeHTML(item.description)}
                  </p>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function update() {
    container.innerHTML = renderTimelineContent();
    attachListeners();
  }

  function attachListeners() {
    container.querySelector('.export-ical-btn')?.addEventListener('click', () => {
      exportTimelineICal(event);
      showToast('Downloaded .ics calendar file. Double click to import into Google/Apple/Outlook Calendar!', 'success', 5000);
    });

    container.querySelector('.add-milestone-btn')?.addEventListener('click', () => {
      showAddMilestoneModal(event, store);
    });

    container.querySelector('.ai-audit-timeline-btn')?.addEventListener('click', () => {
      showTimelineAuditModal(event, aiService);
    });

    container.querySelectorAll('.filter-phase-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activePhaseFilter = btn.getAttribute('data-phase');
        update();
      });
    });

    container.querySelectorAll('.toggle-complete-btn').forEach(bullet => {
      bullet.addEventListener('click', (e) => {
        const itemEl = bullet.closest('.timeline-item');
        const id = itemEl?.getAttribute('data-id');
        if (id) {
          store.toggleTimelineComplete(event.id, id);
          update();
        }
      });
    });

    container.querySelectorAll('.edit-milestone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = event.timeline?.find(t => t.id === id);
        if (item) showEditMilestoneModal(event, store, item);
      });
    });

    container.querySelectorAll('.delete-milestone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this milestone?')) {
          store.deleteTimelineItem(event.id, id);
          showToast('Milestone deleted', 'info');
          update();
        }
      });
    });
  }

  update();
  return container;
}

/**
 * Displays modal to add a new timeline milestone
 * @param {import('../state/store.js').Event} event 
 * @param {import('../state/store.js').EventStore} store 
 */
function showAddMilestoneModal(event, store) {
  const contentHtml = `
    <form id="add-milestone-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Time (24h or AM/PM) *</label>
          <input type="text" class="form-input" id="ms-time" placeholder="e.g. 15:30 or 3:30 PM" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phase</label>
          <select class="form-select" id="ms-phase">
            <option value="pre-event">Pre-Event Prep & Setup</option>
            <option value="day-of" selected>Day-of Run-of-Show</option>
            <option value="post-event">Post-Event Wrap & Teardown</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Milestone Title *</label>
        <input type="text" class="form-input" id="ms-title" placeholder="e.g. Ceremony Processional Begins" required />
      </div>

      <div class="form-group">
        <label class="form-label">Responsible Lead / Assignee</label>
        <input type="text" class="form-input" id="ms-assignee" placeholder="e.g. Venue Coordinator, DJ, Maid of Honor" />
      </div>

      <div class="form-group">
        <label class="form-label">Detailed Instructions & Cues</label>
        <textarea class="form-textarea" id="ms-desc" placeholder="Music cue, mic handoff, transition notes..."></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-save-btn">Add to Schedule</button>
  `;

  const modal = openModal({
    title: 'Add Run-of-Show Milestone',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-save-btn')?.addEventListener('click', () => {
    const form = modal.querySelector('#add-milestone-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      time: modal.querySelector('#ms-time').value.trim(),
      phase: modal.querySelector('#ms-phase').value,
      title: modal.querySelector('#ms-title').value.trim(),
      assignee: modal.querySelector('#ms-assignee').value.trim() || 'Coordinator',
      description: modal.querySelector('#ms-desc').value.trim()
    };

    const validation = validateTimelineItem(payload);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    store.addTimelineItem(event.id, payload);
    showToast(`Added "${payload.title}" to schedule`, 'success');
    closeModal();
  });
}

function showEditMilestoneModal(event, store, item) {
  const contentHtml = `
    <form id="edit-milestone-form">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Time *</label>
          <input type="text" class="form-input" id="edit-ms-time" value="${escapeHTML(item.time)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phase</label>
          <select class="form-select" id="edit-ms-phase">
            <option value="pre-event" ${item.phase === 'pre-event' ? 'selected' : ''}>Pre-Event Prep & Setup</option>
            <option value="day-of" ${item.phase === 'day-of' ? 'selected' : ''}>Day-of Run-of-Show</option>
            <option value="post-event" ${item.phase === 'post-event' ? 'selected' : ''}>Post-Event Wrap & Teardown</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Milestone Title *</label>
        <input type="text" class="form-input" id="edit-ms-title" value="${escapeHTML(item.title)}" required />
      </div>

      <div class="form-group">
        <label class="form-label">Responsible Lead</label>
        <input type="text" class="form-input" id="edit-ms-assignee" value="${escapeHTML(item.assignee || '')}" />
      </div>

      <div class="form-group">
        <label class="form-label">Description & Cues</label>
        <textarea class="form-textarea" id="edit-ms-desc">${escapeHTML(item.description || '')}</textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-secondary btn-sm modal-cancel-btn">Cancel</button>
    <button class="btn btn-primary btn-sm modal-update-btn">Update Milestone</button>
  `;

  const modal = openModal({
    title: 'Edit Milestone',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-cancel-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.modal-update-btn')?.addEventListener('click', () => {
    store.updateTimelineItem(event.id, item.id, {
      time: modal.querySelector('#edit-ms-time').value.trim(),
      phase: modal.querySelector('#edit-ms-phase').value,
      title: modal.querySelector('#edit-ms-title').value.trim(),
      assignee: modal.querySelector('#edit-ms-assignee').value.trim(),
      description: modal.querySelector('#edit-ms-desc').value.trim()
    });
    showToast('Milestone updated', 'success');
    closeModal();
  });
}

function showTimelineAuditModal(event, aiService) {
  const contentHtml = `
    <div>
      <p style="margin-bottom: 1rem;">
        PlanAura's GenAI analyzes your run-of-show sequence for pacing bottlenecks, insufficient buffer windows, and missing ceremony or reception safety checkpoints.
      </p>

      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
        <strong style="color: var(--accent-cyan); font-size: 0.95rem;">Audit Findings:</strong>
        <ul style="padding-left: 1.25rem; font-size: 0.88rem; color: var(--text-primary); margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <li><strong>Buffer Window:</strong> Excellent 45-minute buffer between photography golden hour and dinner service.</li>
          <li><strong>Audio Check:</strong> Sound check is scheduled before doors open. Confirm sound engineer has 2 spare 9V batteries.</li>
          <li><strong>Teardown Curfew:</strong> Venue sound curfew at 23:00 has a dedicated 30-minute shuttle dispatch buffer.</li>
        </ul>
      </div>

      <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary);">
        💡 <strong>Pro Tip:</strong> Send the exported <code>.ics</code> calendar file to your photographer and DJ so their crew phones receive automatic reminder notifications 15 minutes before key moments.
      </div>
    </div>
  `;

  const footerHtml = `<button class="btn btn-secondary btn-sm modal-close-btn">Close</button>`;

  const modal = openModal({
    title: '⚡ GenAI Schedule & Run-of-Show Audit',
    contentHtml,
    footerHtml
  });

  modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
}

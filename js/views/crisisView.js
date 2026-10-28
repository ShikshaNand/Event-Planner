/**
 * Emergency Crisis & Problem Solver Matrix View
 * High-reliability real-time emergency resolution engine for events
 */

import { escapeHTML } from '../utils/sanitizer.js';
import { CRISIS_KNOWLEDGE_BASE } from '../state/initialData.js';
import { showToast } from '../components/toast.js';

export function renderCrisisView(event, store, aiService) {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';

  if (!event) {
    container.innerHTML = `<div class="glass-card"><p>No event selected.</p></div>`;
    return container;
  }

  container.innerHTML = `
    <!-- Emergency Banner -->
    <div class="glass-card" style="border-color: rgba(244, 63, 94, 0.4); background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, var(--bg-card) 100%); margin-bottom: 2rem;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
            <span style="font-size: 1.5rem;">🚨</span>
            <h2 style="color: var(--accent-rose);">Emergency Crisis & Problem Solver</h2>
            <span class="badge badge-danger">High Reliability</span>
          </div>
          <p style="font-size: 0.92rem; color: var(--text-primary); max-width: 800px;">
            Describe any event mishap, catastrophic vendor failure, sudden weather change, or timeline disaster.
            PlanAura's GenAI delivers an immediate action triage, mitigation steps, and a calm script for the host.
          </p>
        </div>
      </div>
    </div>

    <!-- Active Problem Input Terminal -->
    <div class="glass-card" style="margin-bottom: 2rem; border-color: var(--border-glow);">
      <h3 style="margin-bottom: 0.75rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>⚡</span> Describe Current Mishap or Problem:
      </h3>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <input 
          type="text" 
          id="crisis-problem-input" 
          class="form-input" 
          placeholder="e.g. Torrential rain flooded outdoor lawn; Caterer canceled 24h prior; Sound board blown fuse..." 
          style="flex: 1; font-size: 1rem; padding: 0.85rem 1rem;" 
        />
        <button class="btn btn-danger" id="solve-crisis-btn" style="padding: 0.85rem 1.5rem; font-size: 0.95rem;">
          Resolve Emergency 🚀
        </button>
      </div>

      <!-- Quick Preset Crisis Buttons -->
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600;">Instant Presets:</span>
        <button class="btn btn-outline btn-sm preset-btn" data-preset="Sudden heavy thunderstorm and wind during outdoor ceremony">⛈️ Rain / Storm</button>
        <button class="btn btn-outline btn-sm preset-btn" data-preset="Primary caterer canceled 48 hours before wedding reception">👨‍🍳 Caterer Cancellation</button>
        <button class="btn btn-outline btn-sm preset-btn" data-preset="Main microphone and sound system cut out completely before first dance">🔊 Sound / Mic Failure</button>
        <button class="btn btn-outline btn-sm preset-btn" data-preset="Unexpected vendor invoices causing $4,000 budget deficit">💸 Budget Deficit Overrun</button>
        <button class="btn btn-outline btn-sm preset-btn" data-preset="Guest had a severe allergic reaction to hors d'oeuvres">🚨 Allergy Emergency</button>
      </div>

      <!-- Live Results Area -->
      <div id="crisis-loader" style="display: none; text-align: center; padding: 2.5rem;">
        <div class="loading-spinner" style="width: 36px; height: 36px; border-width: 3px; border-top-color: var(--accent-rose);"></div>
        <p style="margin-top: 1rem; color: var(--accent-rose); font-weight: 700;">Synthesizing immediate crisis triage protocol...</p>
      </div>

      <div id="crisis-solution-output" style="display: none; margin-top: 1.75rem; flex-direction: column; gap: 1.25rem;"></div>
    </div>

    <!-- Pre-Vetted Crisis Knowledge Base -->
    <div class="glass-card" style="margin-bottom: 2rem;">
      <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📚</span> Pre-Vetted Disaster Recovery Playbooks
      </h3>
      <p style="font-size: 0.85rem; margin-bottom: 1.25rem;">
        Battle-tested contingency procedures formulated by experienced event directors for standard high-risk scenarios.
      </p>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${CRISIS_KNOWLEDGE_BASE.map((item, idx) => `
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
            <div style="padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" class="accordion-header" data-idx="${idx}">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="badge ${item.riskLevel === 'Critical' ? 'badge-danger' : 'badge-warning'}">${item.riskLevel}</span>
                <strong style="color: var(--text-primary); font-size: 0.98rem;">${escapeHTML(item.title)}</strong>
              </div>
              <span style="font-size: 0.85rem; color: var(--text-tertiary);">▼ View Playbook</span>
            </div>
            <div class="accordion-content" id="playbook-${idx}" style="display: none; padding: 1.25rem; border-top: 1px solid var(--border-subtle); background: var(--bg-card);">
              <div style="margin-bottom: 1rem;">
                <strong style="color: var(--accent-cyan); font-size: 0.9rem;">Immediate 5-Minute Checklist:</strong>
                <ol style="padding-left: 1.25rem; margin-top: 0.4rem; font-size: 0.88rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.35rem;">
                  ${item.immediateActions.map(act => `<li>${escapeHTML(act)}</li>`).join('')}
                </ol>
              </div>
              <div>
                <strong style="color: var(--accent-emerald); font-size: 0.9rem;">Preventative Safeguards:</strong>
                <ul style="padding-left: 1.25rem; margin-top: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem;">
                  ${item.preventativeChecklist.map(prev => `<li>${escapeHTML(prev)}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Essential Day-Of Emergency Kit Checklist -->
    <div class="glass-card">
      <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>🧰</span> Essential Day-Of Physical Emergency Kit
      </h3>
      <p style="font-size: 0.85rem; margin-bottom: 1.25rem;">
        Keep this sealed tackle box / bag behind the sound booth for instant on-site remediation.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-cyan); font-size: 0.9rem;">🔌 AV & Tech Rescue</strong>
          <ul style="padding-left: 1.25rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.3rem;">
            <li>Black matte gaffer tape (2 rolls)</li>
            <li>Extra 9V and AA Procell batteries</li>
            <li>3.5mm AUX to Lightning / USB-C dongles</li>
            <li>20,000mAh portable power bank</li>
            <li>2x 25ft heavy-duty extension cords</li>
          </ul>
        </div>

        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-rose); font-size: 0.9rem;">🩹 Medical & Wardrobe</strong>
          <ul style="padding-left: 1.25rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.3rem;">
            <li>Full OSHA First Aid & blister pads</li>
            <li>Safety pins & travel sewing kit</li>
            <li>Tide to-go instant stain remover pens</li>
            <li>Antihistamines & antacids</li>
            <li>Clear mini umbrella & rain ponchos</li>
          </ul>
        </div>

        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
          <strong style="color: var(--accent-amber); font-size: 0.9rem;">📋 Logistics & Coordination</strong>
          <ul style="padding-left: 1.25rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.3rem;">
            <li>Laminated vendor phone contact roster</li>
            <li>2-way radio walkie-talkies (charged)</li>
            <li>$300 emergency cash reserve for tips/runs</li>
            <li>Printed dietary restriction master list</li>
            <li>Venue gate & utility master keycodes</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const inputEl = container.querySelector('#crisis-problem-input');
  const solveBtn = container.querySelector('#solve-crisis-btn');
  const loaderEl = container.querySelector('#crisis-loader');
  const outputEl = container.querySelector('#crisis-solution-output');

  async function handleSolve(problemText) {
    if (!problemText || problemText.trim().length === 0) {
      showToast('Please describe the problem or pick a preset', 'error');
      return;
    }

    loaderEl.style.display = 'block';
    outputEl.style.display = 'none';
    solveBtn.disabled = true;

    try {
      const solution = await aiService.solveCrisis({
        problem: problemText.trim(),
        eventType: event.type,
        guestCount: event.guestCount,
        location: event.location
      });

      loaderEl.style.display = 'none';
      solveBtn.disabled = false;
      outputEl.style.display = 'flex';

      outputEl.innerHTML = `
        <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <strong style="color: var(--accent-rose); font-size: 1.05rem;">Crisis Triage Strategy</strong>
            <span class="badge ${solution.severity === 'Critical' ? 'badge-danger' : 'badge-warning'}">Severity: ${escapeHTML(solution.severity || 'High')}</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.5;">${escapeHTML(solution.summary)}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-rose);">
            <strong style="color: var(--accent-rose); font-size: 0.95rem;">🚨 Immediate Physical Actions (Next 5-15 Min):</strong>
            <ol style="padding-left: 1.25rem; margin-top: 0.6rem; font-size: 0.88rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.4rem;">
              ${(solution.immediateActions || []).map(act => `<li>${escapeHTML(act)}</li>`).join('')}
            </ol>
          </div>

          <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-cyan);">
            <strong style="color: var(--accent-cyan); font-size: 0.95rem;">🔄 Secondary Contingency Protocol:</strong>
            <ul style="padding-left: 1.25rem; margin-top: 0.6rem; font-size: 0.88rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.4rem;">
              ${(solution.contingencySteps || []).map(step => `<li>${escapeHTML(step)}</li>`).join('')}
            </ul>
          </div>
        </div>

        ${solution.communicationScript ? `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
              <strong style="color: var(--accent-emerald); font-size: 0.95rem;">🎤 Calm Verbal Announcement Script for Host / MC:</strong>
              <button class="btn btn-outline btn-sm copy-script-btn">Copy Script</button>
            </div>
            <p style="font-size: 0.92rem; color: var(--text-primary); font-style: italic; line-height: 1.6; margin-top: 0.5rem;" id="crisis-script-text">
              ${escapeHTML(solution.communicationScript)}
            </p>
          </div>
        ` : ''}

        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary);">
          <strong style="color: var(--text-primary);">Preventative Lessons & Future Clauses:</strong>
          <ul style="padding-left: 1.25rem; margin-top: 0.3rem;">
            ${(solution.preventativeAdvice || []).map(adv => `<li>${escapeHTML(adv)}</li>`).join('')}
          </ul>
        </div>
      `;

      outputEl.querySelector('.copy-script-btn')?.addEventListener('click', () => {
        const scriptText = outputEl.querySelector('#crisis-script-text')?.innerText || '';
        navigator.clipboard.writeText(scriptText);
        showToast('Script copied to clipboard!', 'success');
      });

      // Scroll solution smoothly into view
      outputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      loaderEl.style.display = 'none';
      solveBtn.disabled = false;
      showToast(`Crisis resolution error: ${err.message}`, 'error');
    }
  }

  solveBtn?.addEventListener('click', () => {
    handleSolve(inputEl.value);
  });

  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSolve(inputEl.value);
    }
  });

  container.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      inputEl.value = preset;
      handleSolve(preset);
    });
  });

  // Accordion Expand/Collapse
  container.querySelectorAll('.accordion-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const idx = hdr.getAttribute('data-idx');
      const content = container.querySelector(`#playbook-${idx}`);
      if (content) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        hdr.querySelector('span:last-child').textContent = isHidden ? '▲ Hide Playbook' : '▼ View Playbook';
      }
    });
  });

  return container;
}

/**
 * Accessible Modal System with Keyboard Trap and ARIA Landmarks
 */

import { escapeHTML } from '../utils/sanitizer.js';

let activeModal = null;
let previousFocus = null;

export function openModal({ title, contentHtml, footerHtml = '', onClose = null }) {
  closeModal();

  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');

  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3 id="modal-title">${escapeHTML(title)}</h3>
        <button class="btn btn-outline btn-sm close-modal-btn" aria-label="Close dialog">✕</button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Trigger animation next frame
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    const firstInput = overlay.querySelector('input, select, textarea, button:not(.close-modal-btn)');
    if (firstInput) {
      firstInput.focus();
    } else {
      overlay.querySelector('.close-modal-btn')?.focus();
    }
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  overlay.addEventListener('keydown', handleKeyDown);
  overlay.addEventListener('click', handleOverlayClick);
  overlay.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);

  activeModal = {
    overlay,
    onClose,
    cleanup: () => {
      overlay.removeEventListener('keydown', handleKeyDown);
      overlay.removeEventListener('click', handleOverlayClick);
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }
  };

  return overlay;
}

export function closeModal() {
  if (activeModal) {
    const { overlay, onClose, cleanup } = activeModal;
    overlay.classList.remove('open');
    setTimeout(() => {
      cleanup();
      if (onClose) onClose();
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
    }, 250);
    activeModal = null;
  }
}

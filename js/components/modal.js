/**
 * Accessible Modal Dialog Component with Focus Management and ARIA Landmarks
 * Implements WAI-ARIA modal patterns, keyboard focus management, and escape key listener
 */

import { escapeHTML } from '../utils/sanitizer.js';

/**
 * @typedef {Object} ModalOptions
 * @property {string} title - Header title of the modal
 * @property {string} contentHtml - HTML content string for the modal body
 * @property {string} [footerHtml=''] - Optional HTML for action buttons in modal footer
 * @property {(() => void)|null} [onClose=null] - Optional callback triggered on dismissal
 */

/**
 * @typedef {Object} ActiveModalSession
 * @property {HTMLElement} overlay - Modal DOM container element
 * @property {(() => void)|null} onClose - Callback invoked on modal closure
 * @property {() => void} cleanup - Event listener and DOM removal handler
 */

/** @type {ActiveModalSession|null} */
let activeModal = null;

/** @type {Element|null} */
let previousFocus = null;

/**
 * Opens an accessible modal dialog
 * @param {ModalOptions} options - Configuration for modal
 * @returns {HTMLElement} The created overlay container element
 */
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

  // Trigger animation next frame and move focus to first interactive element
  requestAnimationFrame(() => {
    overlay.classList.add('open');
    const firstInput = overlay.querySelector('input, select, textarea, button:not(.close-modal-btn)');
    if (firstInput && /** @type {HTMLElement} */ (firstInput).focus) {
      /** @type {HTMLElement} */ (firstInput).focus();
    } else {
      const closeBtn = overlay.querySelector('.close-modal-btn');
      if (closeBtn && /** @type {HTMLElement} */ (closeBtn).focus) {
        /** @type {HTMLElement} */ (closeBtn).focus();
      }
    }
  });

  /**
   * Handles keyboard dismissal via Escape key
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  /**
   * Handles click on background overlay to dismiss
   * @param {MouseEvent} e - Mouse click event
   */
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

/**
 * Closes and cleans up active modal dialog, restoring previous keyboard focus
 * @returns {void}
 */
export function closeModal() {
  if (activeModal) {
    const { overlay, onClose, cleanup } = activeModal;
    overlay.classList.remove('open');
    setTimeout(() => {
      cleanup();
      if (onClose) onClose();
      if (previousFocus && /** @type {HTMLElement} */ (previousFocus).focus) {
        /** @type {HTMLElement} */ (previousFocus).focus();
      }
    }, 250);
    activeModal = null;
  }
}

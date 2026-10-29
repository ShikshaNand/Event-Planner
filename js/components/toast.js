/**
 * Accessible Toast Notification System
 * Renders non-blocking notifications with polite aria-live announcements and auto-dismissal
 */

import { escapeHTML } from '../utils/sanitizer.js';

/**
 * Icons mapped to toast alert severity types
 * @type {Readonly<Record<'success'|'error'|'info', string>>}
 */
const TOAST_ICONS = Object.freeze({
  success: '✓',
  error: '✕',
  info: 'ℹ'
});

/** @type {HTMLElement|null} */
let container = null;

/**
 * Ensures global toast container exists in DOM with polite aria-live region
 * @returns {HTMLElement|null} Toast container element
 */
function ensureContainer() {
  if (!container && typeof document !== 'undefined') {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Dispatches an accessible toast notification banner
 * @param {string} message - Text notification message to display
 * @param {'success'|'error'|'info'} [type='info'] - Severity level of the notification
 * @param {number} [duration=3500] - Lifespan in milliseconds before auto-dismissal
 * @returns {void}
 */
export function showToast(message, type = 'info', duration = 3500) {
  const box = ensureContainer();
  if (!box) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <span style="font-weight: 800; font-size: 1.1rem;">${TOAST_ICONS[type] || '•'}</span>
    <span>${escapeHTML(message)}</span>
  `;

  box.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

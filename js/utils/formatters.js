/**
 * Formatting Utilities for AuraPlan AI
 */

/**
 * Format a number into currency
 * @param {number|string} amount 
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format ISO or standard date strings into readable human dates
 * @param {string} dateString 
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'Date TBD';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculates countdown from now to event date
 * @param {string} eventDateString 
 * @returns {{ days: number, label: string, isPast: boolean }}
 */
export function getDaysRemaining(eventDateString) {
  if (!eventDateString) return { days: 0, label: 'Date not set', isPast: false };
  const target = new Date(eventDateString);
  if (isNaN(target.getTime())) return { days: 0, label: 'Invalid date', isPast: false };

  const now = new Date();
  // Strip time for pure day difference
  const utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utc2 = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, isPast: true };
  } else if (diffDays === 0) {
    return { days: 0, label: 'Today!', isPast: false };
  } else if (diffDays === 1) {
    return { days: 1, label: 'Tomorrow', isPast: false };
  } else {
    return { days: diffDays, label: `${diffDays} days away`, isPast: false };
  }
}

/**
 * Format a percentage value safely
 * @param {number} value 
 * @returns {string}
 */
export function formatPercentage(value) {
  const num = Number(value) || 0;
  return `${Math.round(num * 100)}%`;
}

/**
 * Generate a cryptographically random or safe timestamp ID
 * @param {string} [prefix='item']
 * @returns {string}
 */
export function generateId(prefix = 'item') {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36);
  return `${prefix}_${timePart}_${randomPart}`;
}

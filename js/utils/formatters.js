/**
 * Formatting Utilities for PlanAura AI
 * Multi-currency, internationalized date formatting, countdowns, and ID generation
 */

/**
 * Supported currencies with locale mappings for proper symbol placement
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', locale: 'es-MX' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', locale: 'ru-RU' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', locale: 'pl-PL' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', locale: 'ar-EG' }
];

/**
 * Lookup locale by currency code
 * @param {string} currencyCode 
 * @returns {string}
 */
function getLocaleForCurrency(currencyCode) {
  const entry = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return entry ? entry.locale : 'en-US';
}

/**
 * Format a number into localized currency string
 * @param {number|string} amount 
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  const locale = getLocaleForCurrency(currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    // Fallback for unusual currency codes
    const entry = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    const symbol = entry ? entry.symbol : currency;
    return `${symbol}${num.toLocaleString()}`;
  }
}

/**
 * Get currency symbol for a given code
 * @param {string} currencyCode 
 * @returns {string}
 */
export function getCurrencySymbol(currencyCode) {
  const entry = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return entry ? entry.symbol : currencyCode;
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

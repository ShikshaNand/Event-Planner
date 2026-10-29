/**
 * Input and Schema Validators for Data Integrity and Security
 * Provides deterministic type validation, schema conformity, and data sanitization verification
 */

/**
 * Supported event types
 * @type {readonly string[]}
 */
export const VALID_EVENT_TYPES = Object.freeze(['wedding', 'birthday', 'community', 'other']);

/**
 * Supported timeline phases
 * @type {readonly string[]}
 */
export const VALID_TIMELINE_PHASES = Object.freeze(['pre-event', 'day-of', 'post-event']);

/**
 * Supported vendor procurement statuses
 * @type {readonly string[]}
 */
export const VALID_VENDOR_STATUSES = Object.freeze(['researching', 'contacted', 'quoted', 'booked', 'paid']);

/**
 * Supported accessibility requirement statuses
 * @type {readonly string[]}
 */
export const VALID_ACCESSIBILITY_STATUSES = Object.freeze(['in-progress', 'confirmed', 'pending']);

/**
 * Standard validation result payload
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed with 0 errors
 * @property {string[]} errors - Array of human-readable error messages
 */

/**
 * Validates an event object for required attributes and type constraints
 * @param {unknown} event - The candidate event object
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateEvent(event) {
  const errors = [];
  if (!event || typeof event !== 'object') {
    return { isValid: false, errors: ['Event object is required'] };
  }

  const candidate = /** @type {Record<string, any>} */ (event);

  if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    errors.push('Event title cannot be empty.');
  } else if (candidate.title.length > 100) {
    errors.push('Event title cannot exceed 100 characters.');
  }

  if (!candidate.type || !VALID_EVENT_TYPES.includes(candidate.type.toLowerCase())) {
    errors.push(`Event type must be one of: ${VALID_EVENT_TYPES.join(', ')}.`);
  }

  if (!candidate.date) {
    errors.push('Event date is required.');
  } else {
    const d = new Date(candidate.date);
    if (isNaN(d.getTime())) {
      errors.push('Event date is not a valid date.');
    }
  }

  if (candidate.totalBudget !== undefined) {
    const budget = Number(candidate.totalBudget);
    if (isNaN(budget) || budget < 0) {
      errors.push('Total budget must be a positive number.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a budget line item for numerical integrity and categorization
 * @param {unknown} item - Candidate budget item
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateBudgetItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') {
    return { isValid: false, errors: ['Budget item is required.'] };
  }

  const candidate = /** @type {Record<string, any>} */ (item);

  if (!candidate.name || typeof candidate.name !== 'string' || candidate.name.trim().length === 0) {
    errors.push('Item description or name is required.');
  }

  if (!candidate.category || typeof candidate.category !== 'string') {
    errors.push('Category is required.');
  }

  const estimated = Number(candidate.estimatedCost);
  if (isNaN(estimated) || estimated < 0) {
    errors.push('Estimated cost must be a valid positive number.');
  }

  if (candidate.actualCost !== undefined && candidate.actualCost !== '') {
    const actual = Number(candidate.actualCost);
    if (isNaN(actual) || actual < 0) {
      errors.push('Actual cost must be a positive number.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a timeline milestone or run-of-show schedule entry
 * @param {unknown} item - Candidate timeline item
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateTimelineItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') {
    return { isValid: false, errors: ['Timeline item is required.'] };
  }

  const candidate = /** @type {Record<string, any>} */ (item);

  if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    errors.push('Timeline item title is required.');
  }

  if (!candidate.time && !candidate.date) {
    errors.push('Time or milestone date is required.');
  }

  if (candidate.phase && !VALID_TIMELINE_PHASES.includes(candidate.phase)) {
    errors.push(`Phase must be one of: ${VALID_TIMELINE_PHASES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a vendor profile and contact email format
 * @param {unknown} vendor - Candidate vendor object
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateVendor(vendor) {
  const errors = [];
  if (!vendor || typeof vendor !== 'object') {
    return { isValid: false, errors: ['Vendor object is required.'] };
  }

  const candidate = /** @type {Record<string, any>} */ (vendor);

  if (!candidate.name || typeof candidate.name !== 'string' || candidate.name.trim().length === 0) {
    errors.push('Vendor name is required.');
  }

  if (!candidate.category || typeof candidate.category !== 'string') {
    errors.push('Vendor category is required.');
  }

  if (candidate.status && !VALID_VENDOR_STATUSES.includes(candidate.status.toLowerCase())) {
    errors.push(`Status must be one of: ${VALID_VENDOR_STATUSES.join(', ')}.`);
  }

  if (candidate.email && candidate.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidate.email.trim())) {
      errors.push('Vendor email format is invalid.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an accessibility requirement entry
 * @param {unknown} need - Candidate accessibility requirement
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateAccessibilityNeed(need) {
  const errors = [];
  if (!need || typeof need !== 'object') {
    return { isValid: false, errors: ['Accessibility requirement object is required.'] };
  }

  const candidate = /** @type {Record<string, any>} */ (need);

  if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    errors.push('Requirement title is required.');
  }

  if (candidate.status && !VALID_ACCESSIBILITY_STATUSES.includes(candidate.status.toLowerCase())) {
    errors.push(`Status must be one of: ${VALID_ACCESSIBILITY_STATUSES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a creative idea or concept item
 * @param {unknown} idea - Candidate idea object
 * @returns {ValidationResult} Result with status and descriptive errors
 */
export function validateIdea(idea) {
  const errors = [];
  if (!idea || typeof idea !== 'object') {
    return { isValid: false, errors: ['Idea object is required.'] };
  }

  const candidate = /** @type {Record<string, any>} */ (idea);

  if (!candidate.title || typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    errors.push('Idea title is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Input and Schema Validators for Data Integrity and Security
 */

/**
 * Validates an event object
 * @param {object} event 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateEvent(event) {
  const errors = [];
  if (!event || typeof event !== 'object') {
    return { isValid: false, errors: ['Event object is required'] };
  }

  if (!event.title || typeof event.title !== 'string' || event.title.trim().length === 0) {
    errors.push('Event title cannot be empty.');
  } else if (event.title.length > 100) {
    errors.push('Event title cannot exceed 100 characters.');
  }

  const validTypes = ['wedding', 'birthday', 'community', 'other'];
  if (!event.type || !validTypes.includes(event.type.toLowerCase())) {
    errors.push(`Event type must be one of: ${validTypes.join(', ')}.`);
  }

  if (!event.date) {
    errors.push('Event date is required.');
  } else {
    const d = new Date(event.date);
    if (isNaN(d.getTime())) {
      errors.push('Event date is not a valid date.');
    }
  }

  if (event.totalBudget !== undefined) {
    const budget = Number(event.totalBudget);
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
 * Validates a budget line item
 * @param {object} item 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateBudgetItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') {
    return { isValid: false, errors: ['Budget item is required.'] };
  }

  if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
    errors.push('Item description or name is required.');
  }

  if (!item.category || typeof item.category !== 'string') {
    errors.push('Category is required.');
  }

  const estimated = Number(item.estimatedCost);
  if (isNaN(estimated) || estimated < 0) {
    errors.push('Estimated cost must be a valid positive number.');
  }

  if (item.actualCost !== undefined && item.actualCost !== '') {
    const actual = Number(item.actualCost);
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
 * @param {object} item 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateTimelineItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') {
    return { isValid: false, errors: ['Timeline item is required.'] };
  }

  if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
    errors.push('Timeline item title is required.');
  }

  if (!item.time && !item.date) {
    errors.push('Time or milestone date is required.');
  }

  const validPhases = ['pre-event', 'day-of', 'post-event'];
  if (item.phase && !validPhases.includes(item.phase)) {
    errors.push(`Phase must be one of: ${validPhases.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates a vendor profile
 * @param {object} vendor 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateVendor(vendor) {
  const errors = [];
  if (!vendor || typeof vendor !== 'object') {
    return { isValid: false, errors: ['Vendor object is required.'] };
  }

  if (!vendor.name || typeof vendor.name !== 'string' || vendor.name.trim().length === 0) {
    errors.push('Vendor name is required.');
  }

  if (!vendor.category || typeof vendor.category !== 'string') {
    errors.push('Vendor category is required.');
  }

  const validStatuses = ['researching', 'contacted', 'quoted', 'booked', 'paid'];
  if (vendor.status && !validStatuses.includes(vendor.status.toLowerCase())) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
  }

  if (vendor.email && vendor.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendor.email.trim())) {
      errors.push('Vendor email format is invalid.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

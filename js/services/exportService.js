/**
 * Export and Synchronization Utilities
 * Handles CSV, iCal (.ics), JSON, and Print outputs
 */

import { formatCurrency, formatDate } from '../utils/formatters.js';

/**
 * Downloads a text or data file in the browser
 * @param {string} filename 
 * @param {string} content 
 * @param {string} mimeType 
 */
export function downloadFile(filename, content, mimeType) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Transforms event budget items into a standard CSV formatted string
 * Pure function: separated from DOM download for clean testing and reuse
 * @param {object} event 
 * @returns {string}
 */
export function generateBudgetCSV(event) {
  if (!event || !Array.isArray(event.budgetItems) || event.budgetItems.length === 0) {
    return '';
  }
  const headers = ['Category', 'Item Description', 'Estimated Cost', 'Actual Cost', 'Paid to Date', 'Status', 'Notes'];
  const rows = event.budgetItems.map(item => [
    `"${(item.category || '').replace(/"/g, '""')}"`,
    `"${(item.name || '').replace(/"/g, '""')}"`,
    item.estimatedCost || 0,
    item.actualCost || 0,
    item.paidCost || 0,
    `"${item.status || 'pending'}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}

/**
 * Exports budget items to CSV format and triggers browser file download
 * @param {object} event 
 */
export function exportBudgetCSV(event) {
  const csvContent = generateBudgetCSV(event);
  if (!csvContent) return;
  const safeTitle = (event.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(`${safeTitle}_budget.csv`, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string for timeline schedule
 * @param {object} event 
 * @returns {string}
 */
export function generateICal(event) {
  if (!event || !event.timeline) return '';
  const dateBase = (event.date || '2026-11-14').replace(/-/g, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AuraPlan AI//Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  event.timeline.forEach((item, index) => {
    // Format time HHMM00
    const timeClean = (item.time || '12:00').replace(':', '') + '00';
    const dtStart = `${dateBase}T${timeClean}`;
    // Approximate 45 min duration
    const endHour = parseInt(timeClean.slice(0, 2), 10) + 1;
    const endStr = String(endHour > 23 ? 23 : endHour).padStart(2, '0') + timeClean.slice(2);
    const dtEnd = `${dateBase}T${endStr}`;

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${item.id || index}_${dateBase}@auraplan.local`);
    ics.push(`DTSTAMP:${now}`);
    ics.push(`DTSTART:${dtStart}`);
    ics.push(`DTEND:${dtEnd}`);
    ics.push(`SUMMARY:${event.title}: ${item.title}`);
    ics.push(`DESCRIPTION:${item.description || ''} (Assignee: ${item.assignee || 'Organizer'})`);
    ics.push(`LOCATION:${event.location || ''}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Exports timeline to iCal file for calendar import
 * @param {object} event 
 */
export function exportTimelineICal(event) {
  const icsData = generateICal(event);
  const safeTitle = (event.title || 'event').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadFile(`${safeTitle}_schedule.ics`, icsData, 'text/calendar;charset=utf-8;');
}

/**
 * Triggers clean print view for event dossier
 */
export function printEventDossier() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

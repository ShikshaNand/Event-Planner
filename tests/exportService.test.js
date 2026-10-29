import test from 'node:test';
import assert from 'node:assert/strict';
import { generateBudgetCSV, generateICal } from '../js/services/exportService.js';

test('Export and Synchronization Service', async (t) => {
  await t.test('generates properly escaped CSV for event budget ledger', () => {
    const mockEvent = {
      title: 'Botanical Wedding',
      budgetItems: [
        {
          category: 'Venue & Spaces',
          name: 'Greenhouse "Conservatory" Hall',
          estimatedCost: 8000,
          actualCost: 7500,
          paidCost: 4000,
          status: 'booked',
          notes: 'Includes 50 chairs and sound rig'
        },
        {
          category: 'Catering',
          name: 'Farm-to-table Dinner',
          estimatedCost: 6000,
          actualCost: 6200,
          paidCost: 2000,
          status: 'contracted',
          notes: 'Vegetarian and GF options required'
        }
      ]
    };

    const csv = generateBudgetCSV(mockEvent);
    assert.ok(csv.includes('Category,Item Description,Estimated Cost'));
    assert.ok(csv.includes('"Venue & Spaces"'));
    // Checks quote escaping
    assert.ok(csv.includes('Greenhouse ""Conservatory"" Hall'));
    assert.ok(csv.includes('8000,7500,4000'));
    assert.ok(csv.includes('Farm-to-table Dinner'));
  });

  await t.test('handles empty or invalid events safely for CSV generation', () => {
    assert.equal(generateBudgetCSV(null), '');
    assert.equal(generateBudgetCSV({}), '');
    assert.equal(generateBudgetCSV({ budgetItems: [] }), '');
  });

  await t.test('generates valid RFC 5545 iCalendar data for timeline milestones', () => {
    const mockEvent = {
      title: 'Riverside Gala',
      date: '2026-10-25',
      location: 'Riverside Amphitheater',
      timeline: [
        {
          id: 'milestone_1',
          time: '17:00',
          title: 'Guest Arrival & Registration',
          description: 'Distribute lanyards and welcome packets',
          assignee: 'Registration Lead'
        },
        {
          id: 'milestone_2',
          time: '18:30',
          title: 'Keynote Address & Award Ceremony',
          description: 'Opening remarks by chairperson',
          assignee: 'AV Team & Stage Manager'
        }
      ]
    };

    const ics = generateICal(mockEvent);
    assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
    assert.ok(ics.endsWith('END:VCALENDAR'));
    assert.ok(ics.includes('PRODID:-//AuraPlan AI//Event Planner//EN'));
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('SUMMARY:Riverside Gala: Guest Arrival & Registration'));
    assert.ok(ics.includes('DTSTART:20261025T170000'));
    assert.ok(ics.includes('LOCATION:Riverside Amphitheater'));
    assert.ok(ics.includes('STATUS:CONFIRMED'));
  });

  await t.test('handles empty or missing timeline events safely for iCal generation', () => {
    assert.equal(generateICal(null), '');
    assert.equal(generateICal({}), '');
  });
});


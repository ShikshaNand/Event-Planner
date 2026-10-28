import test from 'node:test';
import assert from 'node:assert/strict';
import { eventStore } from '../js/state/store.js';
import { generateICal } from '../js/services/exportService.js';

test('Timeline Operations and iCalendar Generator', async (t) => {
  await t.test('sorts timeline chronologically upon adding new milestones', () => {
    eventStore.resetToDefaults();
    const event = eventStore.getCurrentEvent();

    eventStore.addTimelineItem(event.id, {
      title: 'Late Night Wrap-up',
      time: '23:45',
      phase: 'post-event'
    });

    eventStore.addTimelineItem(event.id, {
      title: 'Early Morning Breakfast',
      time: '06:30',
      phase: 'pre-event'
    });

    const refreshed = eventStore.getCurrentEvent();
    assert.equal(refreshed.timeline[0].time, '06:30');
    assert.equal(refreshed.timeline[refreshed.timeline.length - 1].time, '23:45');
  });

  await t.test('toggles timeline milestone completion status', () => {
    const event = eventStore.getCurrentEvent();
    const firstItem = event.timeline[0];
    const initialStatus = firstItem.completed;

    eventStore.toggleTimelineComplete(event.id, firstItem.id);
    const updated = eventStore.getCurrentEvent().timeline.find(i => i.id === firstItem.id);
    assert.equal(updated.completed, !initialStatus);
  });

  await t.test('generates valid RFC 5545 iCalendar content', () => {
    const event = eventStore.getCurrentEvent();
    const ical = generateICal(event);

    assert.ok(ical.includes('BEGIN:VCALENDAR'));
    assert.ok(ical.includes('VERSION:2.0'));
    assert.ok(ical.includes('BEGIN:VEVENT'));
    assert.ok(ical.includes(`SUMMARY:${event.title}`));
    assert.ok(ical.includes('END:VCALENDAR'));
  });
});

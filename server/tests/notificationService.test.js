const test = require('node:test');
const assert = require('node:assert/strict');

const db = require('../config/db');

const calls = [];
db.promise = () => ({
  execute: async (sql, params = []) => {
    calls.push({ sql, params });

    if (sql.includes('SHOW COLUMNS FROM notifications')) {
      return [[]];
    }

    if (sql.includes('INSERT INTO notifications')) {
      return [{ insertId: 101 }];
    }

    if (sql.includes('SELECT *\n      FROM notifications') && sql.includes('scheduled_at <= NOW()')) {
      return [[{
        id: 101,
        status: 'pending',
        channel: 'sms',
        event: 'order_confirmed',
        recipient: '+919876543210',
        subject: 'Test',
        message: 'Hello user',
        provider: 'none',
        scheduled_at: '2026-09-22 12:00:00',
      }]];
    }

    if (sql.includes('UPDATE notifications')) {
      return [{}];
    }

    return [[]];
  },
});

const {
  scheduleNotification,
  processDueNotifications,
} = require('../services/notificationService');

test('scheduleNotification stores a scheduled datetime', async () => {
  const result = await scheduleNotification({
    channel: 'sms',
    event: 'order_confirmed',
    recipient: '+919876543210',
    subject: 'Test subject',
    message: 'Hello',
    scheduledAt: '2026-09-22T12:00:00Z',
  });

  assert.equal(result.id, 101);
  assert.ok(
    calls.some(({ sql }) => sql.includes('scheduled_at'))
  );
});

test('processDueNotifications flushes pending scheduled notifications', async () => {
  const result = await processDueNotifications({ limit: 10 });

  assert.equal(result.processed, 1);
  assert.equal(result.notifications[0].id, 101);
});

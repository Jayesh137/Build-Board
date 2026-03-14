import cron from 'node-cron';
import { runDailyAlerts } from './daily-alerts.js';
import { runDeadlineReminders } from './deadline-reminders.js';

let scheduled = false;

export function startScheduler(): void {
  if (scheduled) {
    console.warn('[scheduler] Already started, skipping.');
    return;
  }

  scheduled = true;

  // Daily alert digest at 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('[scheduler] Running daily alerts job...');
    try {
      await runDailyAlerts();
    } catch (err) {
      console.error('[scheduler] Daily alerts job failed:', err);
    }
  });

  // Deadline reminders at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('[scheduler] Running deadline reminders job...');
    try {
      await runDeadlineReminders();
    } catch (err) {
      console.error('[scheduler] Deadline reminders job failed:', err);
    }
  });

  console.log('[scheduler] Scheduled jobs:');
  console.log('  - Daily alert digest: 08:00');
  console.log('  - Deadline reminders: 09:00');
}

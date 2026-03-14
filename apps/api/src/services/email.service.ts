import { Resend } from 'resend';
import type { Alert } from './alerts.service.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'BuildTracker <alerts@buildtracker.app>';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function priorityColor(priority: Alert['priority']): string {
  switch (priority) {
    case 'critical':
      return '#DC2626';
    case 'warning':
      return '#D97706';
    case 'info':
      return '#2563EB';
  }
}

function priorityLabel(priority: Alert['priority']): string {
  switch (priority) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Info';
  }
}

function buildAlertGroupHtml(priority: Alert['priority'], items: Alert[]): string {
  if (items.length === 0) return '';

  const color = priorityColor(priority);
  const label = priorityLabel(priority);

  const rows = items
    .map(
      (a) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #E5E7EB;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">
              ${escapeHtml(a.title)}
            </div>
            <div style="font-size: 14px; color: #6B7280;">
              ${escapeHtml(a.description)}
            </div>
          </td>
        </tr>`,
    )
    .join('');

  return `
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background: ${color}; color: white; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px;">
        ${label} (${items.length})
      </div>
      <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #E5E7EB; border-radius: 8px;">
        ${rows}
      </table>
    </div>`;
}

function buildDigestHtml(projectName: string, alerts: Alert[]): string {
  const critical = alerts.filter((a) => a.priority === 'critical');
  const warning = alerts.filter((a) => a.priority === 'warning');
  const info = alerts.filter((a) => a.priority === 'info');

  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 16px;">
      <h1 style="margin: 0 0 4px 0; font-size: 22px; color: #111827;">
        BuildTracker Daily Digest
      </h1>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #6B7280;">
        ${escapeHtml(projectName)} &middot; ${date}
      </p>

      ${alerts.length === 0 ? '<p style="color: #059669; font-weight: 600;">All clear — no alerts today.</p>' : ''}

      ${buildAlertGroupHtml('critical', critical)}
      ${buildAlertGroupHtml('warning', warning)}
      ${buildAlertGroupHtml('info', info)}
    </div>

    <p style="text-align: center; font-size: 12px; color: #9CA3AF;">
      Sent by BuildTracker. Manage notification preferences in your project settings.
    </p>
  </div>
</body>
</html>`;
}

export async function sendAlertDigest(
  to: string,
  projectName: string,
  alerts: Alert[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const critical = alerts.filter((a) => a.priority === 'critical').length;
    const subject = critical > 0
      ? `[Action Required] ${critical} critical alert${critical === 1 ? '' : 's'} — ${projectName}`
      : `Daily Digest — ${projectName}`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: buildDigestHtml(projectName, alerts),
    });

    if (error) {
      console.error('Failed to send alert digest:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send alert digest:', message);
    return { success: false, error: message };
  }
}

export async function sendDeadlineReminder(
  to: string,
  projectName: string,
  alert: Alert,
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: white; border-radius: 12px; padding: 32px;">
      <div style="display: inline-block; background: ${priorityColor(alert.priority)}; color: white; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px;">
        ${priorityLabel(alert.priority)}
      </div>
      <h1 style="margin: 0 0 8px 0; font-size: 20px; color: #111827;">
        ${escapeHtml(alert.title)}
      </h1>
      <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151;">
        ${escapeHtml(alert.description)}
      </p>
      <p style="margin: 0; font-size: 13px; color: #6B7280;">
        Project: ${escapeHtml(projectName)}
      </p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 16px;">
      Sent by BuildTracker. Manage notification preferences in your project settings.
    </p>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[Deadline] ${alert.title} — ${projectName}`,
      html,
    });

    if (error) {
      console.error('Failed to send deadline reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send deadline reminder:', message);
    return { success: false, error: message };
  }
}

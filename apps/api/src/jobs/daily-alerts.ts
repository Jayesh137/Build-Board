import { db } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { projects, projectMembers } from '@buildtracker/db';
import { eq } from 'drizzle-orm';
import { computeAlerts } from '../services/alerts.service.js';
import { sendAlertDigest } from '../services/email.service.js';

export async function runDailyAlerts(): Promise<void> {
  if (!db) {
    console.warn('[daily-alerts] Database not configured, skipping.');
    return;
  }

  console.log('[daily-alerts] Starting daily alert digest...');

  try {
    // Get all projects
    const allProjects = await db.select().from(projects);

    for (const project of allProjects) {
      try {
        // Compute alerts for this project
        const alerts = await computeAlerts(db, project.id);

        // Skip projects with no alerts
        if (alerts.length === 0) {
          console.log(`[daily-alerts] ${project.name}: no alerts, skipping email.`);
          continue;
        }

        // Get project owner(s)
        const owners = await db
          .select()
          .from(projectMembers)
          .where(
            eq(projectMembers.projectId, project.id),
          );

        const ownerMembers = owners.filter((m) => m.role === 'owner');

        for (const member of ownerMembers) {
          try {
            // Look up the user's email from Supabase Auth
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(member.userId);

            if (userError || !userData?.user?.email) {
              console.warn(
                `[daily-alerts] Could not resolve email for user ${member.userId}: ${userError?.message ?? 'no email'}`,
              );
              continue;
            }

            const result = await sendAlertDigest(
              userData.user.email,
              project.name,
              alerts,
            );

            if (result.success) {
              console.log(
                `[daily-alerts] Sent digest to ${userData.user.email} for ${project.name} (${alerts.length} alerts).`,
              );
            } else {
              console.error(
                `[daily-alerts] Failed to send to ${userData.user.email}: ${result.error}`,
              );
            }
          } catch (err) {
            console.error(
              `[daily-alerts] Error sending to user ${member.userId}:`,
              err,
            );
          }
        }
      } catch (err) {
        console.error(
          `[daily-alerts] Error processing project ${project.name}:`,
          err,
        );
      }
    }

    console.log('[daily-alerts] Daily alert digest complete.');
  } catch (err) {
    console.error('[daily-alerts] Fatal error:', err);
  }
}

import { db } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import {
  projects,
  projectMembers,
  vatEntries,
  cilSteps,
  contacts,
} from '@buildtracker/db';
import { eq, and, ne } from 'drizzle-orm';
import { daysUntil } from '@buildtracker/shared';
import { sendDeadlineReminder } from '../services/email.service.js';
import type { Alert } from '../services/alerts.service.js';

export async function runDeadlineReminders(): Promise<void> {
  if (!db) {
    console.warn('[deadline-reminders] Database not configured, skipping.');
    return;
  }

  console.log('[deadline-reminders] Checking high-stakes deadlines...');
  const today = new Date().toISOString().split('T')[0];

  try {
    const allProjects = await db.select().from(projects);

    for (const project of allProjects) {
      const urgentAlerts: Alert[] = [];

      try {
        // ── VAT reclaim deadline ────────────────────────────────────────────
        if (project.targetCompletion) {
          const completionDate = new Date(project.targetCompletion);
          const vatDeadline = new Date(completionDate);
          vatDeadline.setMonth(vatDeadline.getMonth() + 3);
          const deadlineStr = vatDeadline.toISOString().split('T')[0];
          const daysToDeadline = daysUntil(deadlineStr, today);

          if (daysToDeadline >= 0 && daysToDeadline <= 14) {
            urgentAlerts.push({
              id: 'vat-deadline-urgent',
              priority: 'critical',
              module: 'vat',
              title: 'VAT reclaim deadline imminent',
              description: `Only ${daysToDeadline} day${daysToDeadline === 1 ? '' : 's'} until VAT reclaim submission deadline (${deadlineStr}).`,
              link: '/vat',
            });
          }
        }

        // ── CIL blocking steps ──────────────────────────────────────────────
        const blockingSteps = await db
          .select()
          .from(cilSteps)
          .where(
            and(
              eq(cilSteps.projectId, project.id),
              eq(cilSteps.isBlocking, true),
              ne(cilSteps.status, 'confirmed'),
            ),
          );

        for (const step of blockingSteps) {
          if (step.deadline) {
            const days = daysUntil(step.deadline, today);
            if (days >= 0 && days <= 7) {
              urgentAlerts.push({
                id: `cil-deadline-${step.stepNumber}`,
                priority: 'critical',
                module: 'cil',
                title: `CIL deadline: ${step.formName}`,
                description: `${step.description} — deadline in ${days} day${days === 1 ? '' : 's'} (${step.deadline}).`,
                link: '/cil',
              });
            }
          }
        }

        // ── Insurance expiry ────────────────────────────────────────────────
        const allContacts = await db
          .select()
          .from(contacts)
          .where(eq(contacts.projectId, project.id));

        for (const contact of allContacts) {
          if (!contact.insuranceExpiry) continue;
          const days = daysUntil(contact.insuranceExpiry, today);

          if (days >= 0 && days <= 7) {
            urgentAlerts.push({
              id: `insurance-expiry-${contact.id}`,
              priority: 'warning',
              module: 'contacts',
              title: `Insurance expiring: ${contact.name}`,
              description: `${contact.name}'s insurance expires in ${days} day${days === 1 ? '' : 's'} (${contact.insuranceExpiry}). Work must not proceed without valid cover.`,
              link: `/contacts/${contact.id}`,
            });
          }
        }

        // Skip if nothing urgent
        if (urgentAlerts.length === 0) continue;

        // ── Send to project owners ──────────────────────────────────────────
        const owners = await db
          .select()
          .from(projectMembers)
          .where(eq(projectMembers.projectId, project.id));

        const ownerMembers = owners.filter((m) => m.role === 'owner');

        for (const member of ownerMembers) {
          try {
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(member.userId);

            if (userError || !userData?.user?.email) {
              console.warn(
                `[deadline-reminders] Could not resolve email for user ${member.userId}`,
              );
              continue;
            }

            for (const alert of urgentAlerts) {
              const result = await sendDeadlineReminder(
                userData.user.email,
                project.name,
                alert,
              );

              if (result.success) {
                console.log(
                  `[deadline-reminders] Sent ${alert.module} reminder to ${userData.user.email}`,
                );
              } else {
                console.error(
                  `[deadline-reminders] Failed: ${result.error}`,
                );
              }
            }
          } catch (err) {
            console.error(
              `[deadline-reminders] Error for user ${member.userId}:`,
              err,
            );
          }
        }
      } catch (err) {
        console.error(
          `[deadline-reminders] Error processing project ${project.name}:`,
          err,
        );
      }
    }

    console.log('[deadline-reminders] Deadline check complete.');
  } catch (err) {
    console.error('[deadline-reminders] Fatal error:', err);
  }
}

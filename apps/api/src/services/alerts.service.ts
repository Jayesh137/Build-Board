import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  tasks,
  phases,
  inspections,
  budgetCategories,
  budgetEntries,
  vatEntries,
  cilSteps,
  planningConditions,
  contacts,
  decisions,
  diaryEntries,
  snags,
  projects,
} from '@buildtracker/db';
import { eq, and, lt, lte, gte, ne, sql, count, sum, desc, asc } from 'drizzle-orm';
import { daysUntil, isOverdue } from '@buildtracker/shared';

export interface Alert {
  id: string;
  priority: 'critical' | 'warning' | 'info';
  module: string;
  title: string;
  description: string;
  link?: string;
}

export async function computeAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Run all checks in parallel
  await Promise.all([
    checkTimelineAlerts(db, projectId, today, alerts),
    checkInspectionAlerts(db, projectId, alerts),
    checkBudgetAlerts(db, projectId, alerts),
    checkVATAlerts(db, projectId, today, alerts),
    checkCILAlerts(db, projectId, alerts),
    checkPlanningAlerts(db, projectId, alerts),
    checkContactAlerts(db, projectId, today, alerts),
    checkDecisionAlerts(db, projectId, today, alerts),
    checkDiaryAlerts(db, projectId, today, alerts),
    checkSnagAlerts(db, projectId, alerts),
  ]);

  // Sort: critical first, then warning, then info
  const priorityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return alerts;
}

// ─── Timeline ──────────────────────────────────────────────────────────────────

async function checkTimelineAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  today: string,
  alerts: Alert[],
): Promise<void> {
  // Get all phases for this project, then tasks within those phases
  const projectPhases = await db
    .select({ id: phases.id })
    .from(phases)
    .where(eq(phases.projectId, projectId));

  if (projectPhases.length === 0) return;

  const phaseIds = projectPhases.map((p) => p.id);

  // Get all non-done tasks with due dates
  const allTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        sql`${tasks.phaseId} IN ${phaseIds}`,
        ne(tasks.status, 'done'),
      ),
    );

  let overdueIdx = 0;
  let weekIdx = 0;
  let milestoneIdx = 0;

  for (const task of allTasks) {
    if (!task.dueDate) continue;

    const days = daysUntil(task.dueDate, today);

    // Overdue tasks
    if (days < 0) {
      alerts.push({
        id: `timeline-overdue-${overdueIdx++}`,
        priority: 'critical',
        module: 'timeline',
        title: `Overdue: ${task.title}`,
        description: `This task was due ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago (${task.dueDate}).`,
        link: `/tasks/${task.id}`,
      });
    }
    // Due this week
    else if (days <= 7) {
      alerts.push({
        id: `timeline-due-soon-${weekIdx++}`,
        priority: 'warning',
        module: 'timeline',
        title: `Due soon: ${task.title}`,
        description: `Due in ${days} day${days === 1 ? '' : 's'} (${task.dueDate}).`,
        link: `/tasks/${task.id}`,
      });
    }

    // Upcoming milestones (within 14 days)
    if (task.isMilestone && days >= 0 && days <= 14) {
      alerts.push({
        id: `timeline-milestone-${milestoneIdx++}`,
        priority: 'info',
        module: 'timeline',
        title: `Milestone approaching: ${task.title}`,
        description: `Milestone due in ${days} day${days === 1 ? '' : 's'} (${task.dueDate}).`,
        link: `/tasks/${task.id}`,
      });
    }
  }
}

// ─── Inspections ───────────────────────────────────────────────────────────────

async function checkInspectionAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  alerts: Alert[],
): Promise<void> {
  const dueInspections = await db
    .select()
    .from(inspections)
    .where(
      and(
        eq(inspections.projectId, projectId),
        eq(inspections.status, 'due'),
      ),
    );

  dueInspections.forEach((insp, idx) => {
    alerts.push({
      id: `inspection-due-${idx}`,
      priority: 'critical',
      module: 'inspections',
      title: `Inspection due: ${insp.name}`,
      description: 'Inspection must be booked/passed before the next task can proceed.',
      link: `/inspections/${insp.id}`,
    });
  });
}

// ─── Budget ────────────────────────────────────────────────────────────────────

async function checkBudgetAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  alerts: Alert[],
): Promise<void> {
  // Get all budget categories for this project
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.projectId, projectId));

  let overBudgetIdx = 0;

  for (const cat of categories) {
    if (!cat.allocatedAmount || cat.allocatedAmount === 0) continue;

    // Sum paid entries for this category
    const [result] = await db
      .select({ total: sum(budgetEntries.amount) })
      .from(budgetEntries)
      .where(
        and(
          eq(budgetEntries.categoryId, cat.id),
          eq(budgetEntries.status, 'paid'),
        ),
      );

    const totalSpent = Number(result?.total ?? 0);
    const threshold = cat.allocatedAmount * 1.1;

    if (totalSpent > threshold) {
      const overPct = Math.round(((totalSpent - cat.allocatedAmount) / cat.allocatedAmount) * 100);
      alerts.push({
        id: `budget-over-${overBudgetIdx++}`,
        priority: 'warning',
        module: 'budget',
        title: `Over budget: ${cat.name}`,
        description: `Spent ${overPct}% more than allocated (${totalSpent} vs ${cat.allocatedAmount} allocated).`,
        link: '/budget',
      });
    }
  }

  // Check contingency
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (project?.totalBudget && project.contingencyPct) {
    const contingencyAmount = Math.round(project.totalBudget * (project.contingencyPct / 100));

    // Sum all paid entries across all project categories
    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length > 0) {
      const [totalResult] = await db
        .select({ total: sum(budgetEntries.amount) })
        .from(budgetEntries)
        .where(
          and(
            sql`${budgetEntries.categoryId} IN ${categoryIds}`,
            eq(budgetEntries.status, 'paid'),
          ),
        );

      const totalSpent = Number(totalResult?.total ?? 0);
      const totalAllocated = categories.reduce((s, c) => s + (c.allocatedAmount ?? 0), 0);
      const contingencyUsed = Math.max(0, totalSpent - totalAllocated);
      const contingencyRemaining = contingencyAmount - contingencyUsed;
      const contingencyRemainingPct = contingencyAmount > 0
        ? Math.round((contingencyRemaining / contingencyAmount) * 100)
        : 100;

      if (contingencyRemainingPct < 5) {
        alerts.push({
          id: 'budget-contingency-critical',
          priority: 'critical',
          module: 'budget',
          title: 'Contingency nearly exhausted',
          description: `Only ${contingencyRemainingPct}% of contingency budget remains.`,
          link: '/budget',
        });
      } else if (contingencyRemainingPct < 10) {
        alerts.push({
          id: 'budget-contingency-warning',
          priority: 'warning',
          module: 'budget',
          title: 'Contingency running low',
          description: `Only ${contingencyRemainingPct}% of contingency budget remains.`,
          link: '/budget',
        });
      }
    }
  }
}

// ─── VAT ───────────────────────────────────────────────────────────────────────

async function checkVATAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  today: string,
  alerts: Alert[],
): Promise<void> {
  // Check VAT reclaim deadline based on project target completion
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (project?.targetCompletion) {
    // VAT reclaim must be submitted within 3 months of completion cert.
    // Warn if completion + 3 months is within 30 days from today.
    const completionDate = new Date(project.targetCompletion);
    const vatDeadline = new Date(completionDate);
    vatDeadline.setMonth(vatDeadline.getMonth() + 3);
    const deadlineStr = vatDeadline.toISOString().split('T')[0];
    const daysToDeadline = daysUntil(deadlineStr, today);

    if (daysToDeadline >= 0 && daysToDeadline <= 30) {
      alerts.push({
        id: 'vat-deadline-critical',
        priority: 'critical',
        module: 'vat',
        title: 'VAT reclaim deadline approaching',
        description: `VAT reclaim must be submitted within 3 months of completion. Only ${daysToDeadline} day${daysToDeadline === 1 ? '' : 's'} remaining.`,
        link: '/vat',
      });
    }
  }

  // Check for entries needing review
  const [reviewResult] = await db
    .select({ cnt: count() })
    .from(vatEntries)
    .where(
      and(
        eq(vatEntries.projectId, projectId),
        eq(vatEntries.reclaimable, 'needs_review'),
      ),
    );

  const reviewCount = reviewResult?.cnt ?? 0;

  if (reviewCount > 0) {
    alerts.push({
      id: 'vat-needs-review',
      priority: 'warning',
      module: 'vat',
      title: `${reviewCount} VAT entr${reviewCount === 1 ? 'y' : 'ies'} need review`,
      description: 'Some VAT entries have not been classified as reclaimable or non-reclaimable.',
      link: '/vat',
    });
  }
}

// ─── CIL ───────────────────────────────────────────────────────────────────────

async function checkCILAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  alerts: Alert[],
): Promise<void> {
  const blockingSteps = await db
    .select()
    .from(cilSteps)
    .where(
      and(
        eq(cilSteps.projectId, projectId),
        eq(cilSteps.isBlocking, true),
        ne(cilSteps.status, 'confirmed'),
      ),
    )
    .orderBy(asc(cilSteps.stepNumber));

  blockingSteps.forEach((step, idx) => {
    alerts.push({
      id: `cil-blocking-${idx}`,
      priority: 'critical',
      module: 'cil',
      title: `CIL: ${step.formName} not confirmed`,
      description: `${step.description} — this blocking step must be confirmed before commencement.`,
      link: '/cil',
    });
  });
}

// ─── Planning ──────────────────────────────────────────────────────────────────

async function checkPlanningAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  alerts: Alert[],
): Promise<void> {
  const undischarged = await db
    .select()
    .from(planningConditions)
    .where(
      and(
        eq(planningConditions.projectId, projectId),
        eq(planningConditions.conditionType, 'pre_commencement'),
        ne(planningConditions.status, 'discharged'),
      ),
    )
    .orderBy(asc(planningConditions.conditionNumber));

  undischarged.forEach((cond, idx) => {
    alerts.push({
      id: `planning-undischarged-${idx}`,
      priority: 'critical',
      module: 'planning',
      title: `Condition ${cond.conditionNumber} not discharged`,
      description: `Pre-commencement condition: ${cond.description}`,
      link: `/planning/${cond.id}`,
    });
  });
}

// ─── Contacts ──────────────────────────────────────────────────────────────────

async function checkContactAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  today: string,
  alerts: Alert[],
): Promise<void> {
  const allContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.projectId, projectId));

  let idx = 0;
  for (const contact of allContacts) {
    if (!contact.insuranceExpiry) continue;

    const days = daysUntil(contact.insuranceExpiry, today);

    if (days >= 0 && days <= 30) {
      alerts.push({
        id: `contact-insurance-${idx++}`,
        priority: 'warning',
        module: 'contacts',
        title: `Insurance expiring: ${contact.name}`,
        description: `${contact.name}'s insurance expires in ${days} day${days === 1 ? '' : 's'} (${contact.insuranceExpiry}).`,
        link: `/contacts/${contact.id}`,
      });
    }
  }
}

// ─── Decisions ─────────────────────────────────────────────────────────────────

async function checkDecisionAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  today: string,
  alerts: Alert[],
): Promise<void> {
  const openDecisions = await db
    .select()
    .from(decisions)
    .where(
      and(
        eq(decisions.projectId, projectId),
        ne(decisions.status, 'decided'),
        ne(decisions.status, 'ordered'),
      ),
    );

  let deadlineIdx = 0;
  let orderIdx = 0;

  for (const dec of openDecisions) {
    // Deadline within 14 days
    if (dec.deadline) {
      const days = daysUntil(dec.deadline, today);
      if (days >= 0 && days <= 14) {
        alerts.push({
          id: `decision-deadline-${deadlineIdx++}`,
          priority: 'warning',
          module: 'decisions',
          title: `Decision deadline: ${dec.title}`,
          description: `Decision needed within ${days} day${days === 1 ? '' : 's'} (${dec.deadline}).`,
          link: `/decisions/${dec.id}`,
        });
      }
    }

    // Order-by date within 7 days
    if (dec.orderByDate) {
      const days = daysUntil(dec.orderByDate, today);
      if (days >= 0 && days <= 7) {
        alerts.push({
          id: `decision-order-by-${orderIdx++}`,
          priority: 'warning',
          module: 'decisions',
          title: `Order deadline: ${dec.title}`,
          description: `Must be ordered within ${days} day${days === 1 ? '' : 's'} to meet lead time (${dec.orderByDate}).`,
          link: `/decisions/${dec.id}`,
        });
      }
    }
  }
}

// ─── Diary ─────────────────────────────────────────────────────────────────────

async function checkDiaryAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  today: string,
  alerts: Alert[],
): Promise<void> {
  // Check if project is in construction (has an active phase)
  const activePhases = await db
    .select()
    .from(phases)
    .where(
      and(
        eq(phases.projectId, projectId),
        eq(phases.status, 'in_progress'),
      ),
    )
    .limit(1);

  if (activePhases.length === 0) return;

  // Get latest diary entry
  const [latestEntry] = await db
    .select({ entryDate: diaryEntries.entryDate })
    .from(diaryEntries)
    .where(eq(diaryEntries.projectId, projectId))
    .orderBy(desc(diaryEntries.entryDate))
    .limit(1);

  if (!latestEntry) {
    alerts.push({
      id: 'diary-no-entries',
      priority: 'info',
      module: 'diary',
      title: 'No site diary entries',
      description: 'Construction is in progress but no diary entries have been recorded yet.',
      link: '/diary',
    });
    return;
  }

  // Count working days since last entry (exclude weekends)
  const lastDate = new Date(latestEntry.entryDate);
  const todayDate = new Date(today);
  let workingDays = 0;
  const current = new Date(lastDate);
  current.setDate(current.getDate() + 1);

  while (current <= todayDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  if (workingDays >= 2) {
    alerts.push({
      id: 'diary-gap',
      priority: 'info',
      module: 'diary',
      title: 'Site diary gap',
      description: `No diary entry for ${workingDays} working day${workingDays === 1 ? '' : 's'}. Last entry: ${latestEntry.entryDate}.`,
      link: '/diary',
    });
  }
}

// ─── Snags ─────────────────────────────────────────────────────────────────────

async function checkSnagAlerts(
  db: PostgresJsDatabase<any>,
  projectId: string,
  alerts: Alert[],
): Promise<void> {
  const [result] = await db
    .select({ cnt: count() })
    .from(snags)
    .where(
      and(
        eq(snags.projectId, projectId),
        eq(snags.status, 'open'),
      ),
    );

  const openCount = result?.cnt ?? 0;

  if (openCount > 0) {
    alerts.push({
      id: 'snags-open',
      priority: 'info',
      module: 'snags',
      title: `${openCount} open snag${openCount === 1 ? '' : 's'}`,
      description: `There ${openCount === 1 ? 'is' : 'are'} ${openCount} unresolved snag${openCount === 1 ? '' : 's'} requiring attention.`,
      link: '/snags',
    });
  }
}

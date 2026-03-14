import { cilSteps } from '@buildtracker/db';
import { canCommence, getNextRequiredStep } from '@buildtracker/shared';
import { eq, and, asc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── Get CIL Status ────────────────────────────────────────────────────────

export async function getCILStatus(db: PostgresJsDatabase<any>, projectId: string) {
  const steps = await db
    .select()
    .from(cilSteps)
    .where(eq(cilSteps.projectId, projectId))
    .orderBy(asc(cilSteps.stepNumber));

  const mappedSteps = steps.map((s) => ({
    stepNumber: s.stepNumber,
    formName: s.formName,
    status: s.status as 'not_started' | 'submitted' | 'confirmed' | 'overdue',
    isBlocking: s.isBlocking ?? false,
  }));

  const commencement = canCommence(mappedSteps);
  const nextRequired = getNextRequiredStep(mappedSteps);

  return {
    steps,
    commencement,
    nextRequired,
  };
}

// ─── Update CIL Step ────────────────────────────────────────────────────────

export async function updateCILStep(
  db: PostgresJsDatabase<any>,
  stepId: string,
  data: {
    status?: string;
    submittedDate?: string | null;
    confirmedDate?: string | null;
    deadline?: string | null;
    notes?: string | null;
  },
  userId: string,
  projectId: string,
) {
  const [current] = await db
    .select()
    .from(cilSteps)
    .where(eq(cilSteps.id, stepId))
    .limit(1);

  if (!current) return null;

  // Validate status transitions
  if (data.status) {
    const validTransitions: Record<string, string[]> = {
      not_started: ['submitted', 'overdue'],
      submitted: ['confirmed', 'overdue', 'not_started'],
      confirmed: ['overdue'],
      overdue: ['submitted', 'confirmed'],
    };

    const allowed = validTransitions[current.status] ?? [];
    if (!allowed.includes(data.status)) {
      return {
        error: `Cannot transition from '${current.status}' to '${data.status}'`,
        code: 'INVALID_TRANSITION',
      };
    }
  }

  const updateData: Record<string, any> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.submittedDate !== undefined) updateData.submittedDate = data.submittedDate;
  if (data.confirmedDate !== undefined) updateData.confirmedDate = data.confirmedDate;
  if (data.deadline !== undefined) updateData.deadline = data.deadline;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const [updated] = await db
    .update(cilSteps)
    .set(updateData)
    .where(eq(cilSteps.id, stepId))
    .returning();

  const statusChange = data.status && data.status !== current.status
    ? ` (${current.status} -> ${data.status})`
    : '';

  await logActivity(
    db,
    projectId,
    userId,
    'planning',
    'updated',
    'cil_step',
    stepId,
    `Updated CIL step: ${current.formName}${statusChange}`,
  );

  return updated;
}

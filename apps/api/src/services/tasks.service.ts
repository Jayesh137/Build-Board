import {
  phases,
  tasks,
  taskDependencies,
  inspections,
  cilSteps,
} from '@buildtracker/db';
import { canCommence, isCommencementAction } from '@buildtracker/shared';
import { eq, and, asc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── List Phases with Nested Tasks ──────────────────────────────────────────

export async function listPhases(db: PostgresJsDatabase<any>, projectId: string) {
  const allPhases = await db
    .select()
    .from(phases)
    .where(eq(phases.projectId, projectId))
    .orderBy(asc(phases.sortOrder));

  const allTasks = await db
    .select()
    .from(tasks)
    .orderBy(asc(tasks.sortOrder));

  const phaseIds = new Set(allPhases.map((p) => p.id));

  const phaseTasks = allTasks.filter((t) => phaseIds.has(t.phaseId!));

  return allPhases.map((phase) => ({
    ...phase,
    tasks: phaseTasks.filter((t) => t.phaseId === phase.id),
  }));
}

// ─── Get Task with Dependencies ─────────────────────────────────────────────

export async function getTask(db: PostgresJsDatabase<any>, taskId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task) return null;

  const deps = await db
    .select()
    .from(taskDependencies)
    .where(eq(taskDependencies.taskId, taskId));

  const dependsOnIds = deps.map((d) => d.dependsOnId);

  let dependsOnTasks: any[] = [];
  if (dependsOnIds.length > 0) {
    const allDepTasks = await Promise.all(
      dependsOnIds.map((id) =>
        db.select().from(tasks).where(eq(tasks.id, id)).limit(1),
      ),
    );
    dependsOnTasks = allDepTasks.flat();
  }

  return {
    ...task,
    dependencies: dependsOnTasks,
  };
}

// ─── Create Task ────────────────────────────────────────────────────────────

export async function createTask(
  db: PostgresJsDatabase<any>,
  phaseId: string,
  data: {
    title: string;
    description?: string;
    assigneeId?: string;
    startDate?: string;
    dueDate?: string;
    isMilestone?: boolean;
    inspectionRequired?: boolean;
    notes?: string;
  },
  userId: string,
  projectId: string,
) {
  // Get max sort order for this phase
  const existingTasks = await db
    .select({ sortOrder: tasks.sortOrder })
    .from(tasks)
    .where(eq(tasks.phaseId, phaseId))
    .orderBy(asc(tasks.sortOrder));

  const maxSort =
    existingTasks.length > 0
      ? Math.max(...existingTasks.map((t) => t.sortOrder))
      : -1;

  const [created] = await db
    .insert(tasks)
    .values({
      phaseId,
      title: data.title,
      description: data.description ?? null,
      assigneeId: data.assigneeId ?? null,
      startDate: data.startDate ?? null,
      dueDate: data.dueDate ?? null,
      isMilestone: data.isMilestone ?? false,
      inspectionRequired: data.inspectionRequired ?? false,
      notes: data.notes ?? null,
      sortOrder: maxSort + 1,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'timeline',
    'created',
    'task',
    created.id,
    `Created task: ${data.title}`,
  );

  return created;
}

// ─── Update Task ────────────────────────────────────────────────────────────

export async function updateTask(
  db: PostgresJsDatabase<any>,
  taskId: string,
  data: Record<string, any>,
  userId: string,
  projectId: string,
) {
  // Get current task state
  const [current] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!current) return null;

  // If transitioning to in_progress or done on a construction task, check CIL
  if (
    data.status &&
    (data.status === 'in_progress' || data.status === 'done') &&
    current.status === 'not_started' &&
    isCommencementAction(current.title)
  ) {
    const steps = await db
      .select()
      .from(cilSteps)
      .where(eq(cilSteps.projectId, projectId))
      .orderBy(asc(cilSteps.stepNumber));

    const cilCheck = canCommence(
      steps.map((s) => ({
        stepNumber: s.stepNumber,
        formName: s.formName,
        status: s.status as 'not_started' | 'submitted' | 'confirmed' | 'overdue',
        isBlocking: s.isBlocking ?? false,
      })),
    );

    if (!cilCheck.allowed) {
      return { error: cilCheck.reason, code: 'CIL_BLOCK' };
    }
  }

  const [updated] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, taskId))
    .returning();

  // If status changed to done and inspection is required, set linked inspection to 'due'
  if (data.status === 'done' && current.inspectionRequired) {
    const linkedInspections = await db
      .select()
      .from(inspections)
      .where(eq(inspections.linkedTaskId, taskId));

    for (const insp of linkedInspections) {
      if (insp.status === 'not_needed') {
        await db
          .update(inspections)
          .set({ status: 'due' })
          .where(eq(inspections.id, insp.id));
      }
    }
  }

  const statusChange = data.status && data.status !== current.status
    ? ` (${current.status} -> ${data.status})`
    : '';

  await logActivity(
    db,
    projectId,
    userId,
    'timeline',
    'updated',
    'task',
    taskId,
    `Updated task: ${current.title}${statusChange}`,
  );

  return updated;
}

// ─── Delete Task ────────────────────────────────────────────────────────────

export async function deleteTask(
  db: PostgresJsDatabase<any>,
  taskId: string,
  userId: string,
  projectId: string,
) {
  const [existing] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!existing) return null;

  await db.delete(taskDependencies).where(eq(taskDependencies.taskId, taskId));
  await db.delete(taskDependencies).where(eq(taskDependencies.dependsOnId, taskId));
  await db.delete(tasks).where(eq(tasks.id, taskId));

  await logActivity(
    db,
    projectId,
    userId,
    'timeline',
    'deleted',
    'task',
    taskId,
    `Deleted task: ${existing.title}`,
  );

  return existing;
}

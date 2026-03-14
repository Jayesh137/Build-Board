import { inspections, tasks } from '@buildtracker/db';
import { eq, and, asc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── List Inspections ───────────────────────────────────────────────────────

export async function listInspections(db: PostgresJsDatabase<any>, projectId: string) {
  const results = await db
    .select()
    .from(inspections)
    .where(eq(inspections.projectId, projectId))
    .orderBy(asc(inspections.sortOrder));

  return results;
}

// ─── Get Inspection ─────────────────────────────────────────────────────────

export async function getInspection(db: PostgresJsDatabase<any>, inspectionId: string) {
  const [result] = await db
    .select()
    .from(inspections)
    .where(eq(inspections.id, inspectionId))
    .limit(1);

  if (!result) return null;

  // Get linked task if any
  let linkedTask = null;
  if (result.linkedTaskId) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, result.linkedTaskId))
      .limit(1);
    linkedTask = task ?? null;
  }

  return { ...result, linkedTask };
}

// ─── Update Inspection ──────────────────────────────────────────────────────

export async function updateInspection(
  db: PostgresJsDatabase<any>,
  id: string,
  data: {
    name?: string;
    type?: string;
    linkedTaskId?: string | null;
    status?: string;
    scheduledDate?: string | null;
    resultNotes?: string | null;
    inspector?: string | null;
  },
  userId: string,
  projectId: string,
) {
  const [current] = await db
    .select()
    .from(inspections)
    .where(eq(inspections.id, id))
    .limit(1);

  if (!current) return null;

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.linkedTaskId !== undefined) updateData.linkedTaskId = data.linkedTaskId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate;
  if (data.resultNotes !== undefined) updateData.resultNotes = data.resultNotes;
  if (data.inspector !== undefined) updateData.inspector = data.inspector;

  const [updated] = await db
    .update(inspections)
    .set(updateData)
    .where(eq(inspections.id, id))
    .returning();

  // If inspection passed, unblock dependent tasks
  if (data.status === 'passed' && current.status !== 'passed' && current.linkedTaskId) {
    // Find tasks that depend on the linked task and are blocked
    // The linked task's inspection passing means downstream work can continue
    const dependentTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, 'blocked'));

    // Unblock tasks whose notes reference this inspection or that are in the same phase
    // A more targeted approach: check if the blocked task is the next task after the linked task
    if (current.linkedTaskId) {
      const [linkedTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, current.linkedTaskId))
        .limit(1);

      if (linkedTask) {
        // Get tasks in the same phase that are blocked and have a higher sort order
        const blockedFollowers = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.phaseId, linkedTask.phaseId!),
              eq(tasks.status, 'blocked'),
            ),
          );

        for (const blocked of blockedFollowers) {
          if (blocked.sortOrder > linkedTask.sortOrder) {
            await db
              .update(tasks)
              .set({ status: 'not_started' })
              .where(eq(tasks.id, blocked.id));
          }
        }
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
    'inspections',
    'updated',
    'inspection',
    id,
    `Updated inspection: ${current.name}${statusChange}`,
  );

  return updated;
}

// ─── Create Inspection ──────────────────────────────────────────────────────

export async function createInspection(
  db: PostgresJsDatabase<any>,
  data: {
    projectId: string;
    name: string;
    type: string;
    linkedTaskId?: string;
    status?: string;
    scheduledDate?: string;
    inspector?: string;
    isCustom?: boolean;
    sortOrder?: number;
  },
  userId: string,
) {
  // Get max sort order for this project
  const existing = await db
    .select({ sortOrder: inspections.sortOrder })
    .from(inspections)
    .where(eq(inspections.projectId, data.projectId))
    .orderBy(asc(inspections.sortOrder));

  const maxSort =
    existing.length > 0
      ? Math.max(...existing.map((e) => e.sortOrder))
      : -1;

  const [created] = await db
    .insert(inspections)
    .values({
      projectId: data.projectId,
      name: data.name,
      type: data.type,
      linkedTaskId: data.linkedTaskId ?? null,
      status: data.status ?? 'due',
      scheduledDate: data.scheduledDate ?? null,
      inspector: data.inspector ?? null,
      isCustom: data.isCustom ?? true,
      sortOrder: data.sortOrder ?? maxSort + 1,
    })
    .returning();

  await logActivity(
    db,
    data.projectId,
    userId,
    'inspections',
    'created',
    'inspection',
    created.id,
    `Created inspection: ${data.name}`,
  );

  return created;
}

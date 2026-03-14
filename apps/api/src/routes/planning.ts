import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { planningConditions } from '@buildtracker/db';
import { eq, and, asc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createPlanningConditionSchema, updateCILStepSchema } from '@buildtracker/shared';
import { getCILStatus, updateCILStep } from '../services/cil.service.js';
import { logActivity } from '../services/activity.service.js';

const planningRoutes = new Hono();

// GET /planning — conditions + CIL status
planningRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');

  const conditions = await db
    .select()
    .from(planningConditions)
    .where(eq(planningConditions.projectId, projectId))
    .orderBy(asc(planningConditions.conditionNumber));

  const cil = await getCILStatus(db, projectId);

  return c.json({ conditions, cil });
});

// POST /planning/conditions — create condition (owner only)
planningRoutes.post('/conditions', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createPlanningConditionSchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(planningConditions)
    .values({
      projectId,
      conditionNumber: parsed.data.conditionNumber,
      description: parsed.data.description,
      conditionType: parsed.data.conditionType,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'planning',
    'created',
    'planning_condition',
    created.id,
    `Created condition ${parsed.data.conditionNumber}: ${parsed.data.description}`,
  );

  return c.json(created, 201);
});

// PATCH /planning/conditions/:id — update condition
planningRoutes.patch('/conditions/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(planningConditions)
    .where(
      and(
        eq(planningConditions.id, id),
        eq(planningConditions.projectId, projectId),
      ),
    )
    .limit(1);

  if (!existing) return c.json({ error: 'Condition not found' }, 404);

  const updateData: Record<string, any> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.submissionDate !== undefined) updateData.submissionDate = body.submissionDate;
  if (body.decisionDate !== undefined) updateData.decisionDate = body.decisionDate;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const [updated] = await db
    .update(planningConditions)
    .set(updateData)
    .where(eq(planningConditions.id, id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'planning',
    'updated',
    'planning_condition',
    id,
    `Updated condition ${existing.conditionNumber}: ${existing.description}`,
  );

  return c.json(updated);
});

// GET /planning/cil — CIL status
planningRoutes.get('/cil', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const cil = await getCILStatus(db, projectId);
  return c.json(cil);
});

// PATCH /planning/cil/:id — update CIL step
planningRoutes.patch('/cil/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateCILStepSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const result = await updateCILStep(db, id, parsed.data, userId, projectId);

  if (!result) return c.json({ error: 'CIL step not found' }, 404);

  if ('code' in result && result.code === 'INVALID_TRANSITION') {
    return c.json({ error: result.error, code: result.code }, 400);
  }

  return c.json(result);
});

export { planningRoutes };

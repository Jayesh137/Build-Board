import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { decisions, decisionOptions } from '@buildtracker/db';
import { eq, and, asc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createDecisionSchema, createDecisionOptionSchema } from '@buildtracker/shared';
import { logActivity } from '../services/activity.service.js';

const decisionRoutes = new Hono();

// GET /decisions — list decisions ordered by deadline, with options
decisionRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');

  const allDecisions = await db
    .select()
    .from(decisions)
    .where(eq(decisions.projectId, projectId))
    .orderBy(asc(decisions.deadline));

  // Fetch options for each decision
  const result = [];
  for (const decision of allDecisions) {
    const options = await db
      .select()
      .from(decisionOptions)
      .where(eq(decisionOptions.decisionId, decision.id))
      .orderBy(asc(decisionOptions.sortOrder));

    result.push({ ...decision, options });
  }

  return c.json({ decisions: result });
});

// POST /decisions — create decision (owner only)
decisionRoutes.post('/', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createDecisionSchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Auto-calculate order_by_date = deadline - lead_time_days
  let orderByDate: string | null = null;
  if (parsed.data.deadline && parsed.data.leadTimeDays) {
    const deadlineDate = new Date(parsed.data.deadline);
    deadlineDate.setDate(deadlineDate.getDate() - parsed.data.leadTimeDays);
    orderByDate = deadlineDate.toISOString().split('T')[0];
  }

  const [created] = await db
    .insert(decisions)
    .values({
      projectId,
      title: parsed.data.title,
      category: parsed.data.category ?? null,
      deadline: parsed.data.deadline ?? null,
      leadTimeDays: parsed.data.leadTimeDays ?? null,
      orderByDate,
      linkedTaskId: parsed.data.linkedTaskId ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'decisions',
    'created',
    'decision',
    created.id,
    `Created decision: ${parsed.data.title}`,
  );

  return c.json({ ...created, options: [] }, 201);
});

// GET /decisions/:id — get decision with options
decisionRoutes.get('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const id = c.req.param('id');

  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.projectId, projectId)))
    .limit(1);

  if (!decision) return c.json({ error: 'Decision not found' }, 404);

  const options = await db
    .select()
    .from(decisionOptions)
    .where(eq(decisionOptions.decisionId, id))
    .orderBy(asc(decisionOptions.sortOrder));

  return c.json({ ...decision, options });
});

// PATCH /decisions/:id — update decision
decisionRoutes.patch('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Decision not found' }, 404);

  const updateData: Record<string, any> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.deadline !== undefined) updateData.deadline = body.deadline;
  if (body.leadTimeDays !== undefined) updateData.leadTimeDays = body.leadTimeDays;
  if (body.linkedTaskId !== undefined) updateData.linkedTaskId = body.linkedTaskId;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.decidedDate !== undefined) updateData.decidedDate = body.decidedDate;
  if (body.decidedBy !== undefined) updateData.decidedBy = body.decidedBy;

  // Recalculate order_by_date if deadline or leadTimeDays changed
  const effectiveDeadline = updateData.deadline ?? existing.deadline;
  const effectiveLeadTime = updateData.leadTimeDays ?? existing.leadTimeDays;
  if (effectiveDeadline && effectiveLeadTime) {
    const deadlineDate = new Date(effectiveDeadline);
    deadlineDate.setDate(deadlineDate.getDate() - effectiveLeadTime);
    updateData.orderByDate = deadlineDate.toISOString().split('T')[0];
  } else if (body.deadline !== undefined || body.leadTimeDays !== undefined) {
    // One was cleared
    updateData.orderByDate = null;
  }

  const [updated] = await db
    .update(decisions)
    .set(updateData)
    .where(eq(decisions.id, id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'decisions',
    'updated',
    'decision',
    id,
    `Updated decision: ${existing.title}`,
  );

  return c.json(updated);
});

// POST /decisions/:id/options — add option
decisionRoutes.post('/:id/options', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  // Verify decision belongs to this project
  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.projectId, projectId)))
    .limit(1);

  if (!decision) return c.json({ error: 'Decision not found' }, 404);

  const body = await c.req.json();
  const parsed = createDecisionOptionSchema.safeParse({ ...body, decisionId: id });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(decisionOptions)
    .values({
      decisionId: id,
      name: parsed.data.name,
      supplier: parsed.data.supplier ?? null,
      cost: parsed.data.cost ?? null,
      pros: parsed.data.pros ?? null,
      cons: parsed.data.cons ?? null,
      isChosen: parsed.data.isChosen ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'decisions',
    'created',
    'decision_option',
    created.id,
    `Added option "${parsed.data.name}" to decision: ${decision.title}`,
  );

  return c.json(created, 201);
});

// PATCH /decisions/:id/options/:optionId — update option
decisionRoutes.patch('/:id/options/:optionId', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');
  const optionId = c.req.param('optionId');

  // Verify decision belongs to this project
  const [decision] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.projectId, projectId)))
    .limit(1);

  if (!decision) return c.json({ error: 'Decision not found' }, 404);

  // Verify option belongs to this decision
  const [existingOption] = await db
    .select()
    .from(decisionOptions)
    .where(and(eq(decisionOptions.id, optionId), eq(decisionOptions.decisionId, id)))
    .limit(1);

  if (!existingOption) return c.json({ error: 'Option not found' }, 404);

  const body = await c.req.json();

  const updateData: Record<string, any> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.supplier !== undefined) updateData.supplier = body.supplier;
  if (body.cost !== undefined) updateData.cost = body.cost;
  if (body.pros !== undefined) updateData.pros = body.pros;
  if (body.cons !== undefined) updateData.cons = body.cons;
  if (body.isChosen !== undefined) updateData.isChosen = body.isChosen;
  if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

  // If setting is_chosen = true, reset all other options and update decision status
  if (body.isChosen === true) {
    // Set all other options to is_chosen = false
    const allOptions = await db
      .select()
      .from(decisionOptions)
      .where(eq(decisionOptions.decisionId, id));

    for (const opt of allOptions) {
      if (opt.id !== optionId) {
        await db
          .update(decisionOptions)
          .set({ isChosen: false })
          .where(eq(decisionOptions.id, opt.id));
      }
    }

    // Update decision status to 'decided' and set decided_date
    const today = new Date().toISOString().split('T')[0];
    await db
      .update(decisions)
      .set({ status: 'decided', decidedDate: today, decidedBy: userId })
      .where(eq(decisions.id, id));
  }

  const [updated] = await db
    .update(decisionOptions)
    .set(updateData)
    .where(eq(decisionOptions.id, optionId))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'decisions',
    'updated',
    'decision_option',
    optionId,
    `Updated option "${existingOption.name}" on decision: ${decision.title}`,
  );

  return c.json(updated);
});

// DELETE /decisions/:id — delete decision (owner only)
decisionRoutes.delete('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Decision not found' }, 404);

  await db.delete(decisions).where(eq(decisions.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'decisions',
    'deleted',
    'decision',
    id,
    `Deleted decision: ${existing.title}`,
  );

  return c.json({ success: true });
});

export { decisionRoutes };

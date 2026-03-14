import { Hono } from 'hono';
import crypto from 'crypto';
import { db } from '../lib/db.js';
import { snags } from '@buildtracker/db';
import { eq, and, desc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createSnagSchema, updateSnagSchema } from '@buildtracker/shared';
import { logActivity } from '../services/activity.service.js';

const snagRoutes = new Hono();

// GET /snags — list snags, filterable by status/room/severity/category, with status counts
snagRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const statusFilter = c.req.query('status');
  const roomFilter = c.req.query('room');
  const severityFilter = c.req.query('severity');
  const categoryFilter = c.req.query('category');

  let allSnags = await db
    .select()
    .from(snags)
    .where(eq(snags.projectId, projectId))
    .orderBy(desc(snags.createdAt));

  // Calculate status counts before filtering
  const counts: Record<string, number> = {};
  for (const snag of allSnags) {
    counts[snag.status] = (counts[snag.status] || 0) + 1;
  }

  // Apply filters
  if (statusFilter) {
    allSnags = allSnags.filter((s) => s.status === statusFilter);
  }
  if (roomFilter) {
    allSnags = allSnags.filter((s) => s.room === roomFilter);
  }
  if (severityFilter) {
    allSnags = allSnags.filter((s) => s.severity === severityFilter);
  }
  if (categoryFilter) {
    allSnags = allSnags.filter((s) => s.category === categoryFilter);
  }

  return c.json({ snags: allSnags, counts });
});

// POST /snags — create snag with auto-generated share_token
snagRoutes.post('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createSnagSchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Generate unique share token
  const shareToken = crypto.randomBytes(16).toString('hex');

  const [created] = await db
    .insert(snags)
    .values({
      projectId,
      title: parsed.data.title,
      room: parsed.data.room ?? null,
      category: parsed.data.category ?? null,
      severity: parsed.data.severity ?? null,
      description: parsed.data.description ?? null,
      photoIds: parsed.data.photoIds ?? null,
      responsibleContact: parsed.data.responsibleContact ?? null,
      dateFound: parsed.data.dateFound,
      deadline: parsed.data.deadline ?? null,
      shareToken,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'snags',
    'created',
    'snag',
    created.id,
    `Created snag: ${parsed.data.title}`,
  );

  return c.json(created, 201);
});

// GET /snags/:id — get snag detail
snagRoutes.get('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const id = c.req.param('id');

  const [snag] = await db
    .select()
    .from(snags)
    .where(and(eq(snags.id, id), eq(snags.projectId, projectId)))
    .limit(1);

  if (!snag) return c.json({ error: 'Snag not found' }, 404);

  return c.json(snag);
});

// PATCH /snags/:id — update snag with status transitions
snagRoutes.patch('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateSnagSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(snags)
    .where(and(eq(snags.id, id), eq(snags.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Snag not found' }, 404);

  // Handle status transitions
  const validTransitions: Record<string, string[]> = {
    open: ['assigned', 'in_progress', 'fixed'],
    assigned: ['in_progress', 'fixed', 'open'],
    in_progress: ['fixed', 'open', 'assigned'],
    fixed: ['verified', 'open', 'in_progress'],
    verified: ['open'], // can reopen if needed
  };

  if (parsed.data.status && parsed.data.status !== existing.status) {
    const allowed = validTransitions[existing.status];
    if (allowed && !allowed.includes(parsed.data.status)) {
      return c.json({
        error: `Cannot transition from "${existing.status}" to "${parsed.data.status}"`,
        code: 'INVALID_TRANSITION',
      }, 400);
    }
  }

  const updateData: Record<string, any> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.room !== undefined) updateData.room = parsed.data.room;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.severity !== undefined) updateData.severity = parsed.data.severity;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.photoIds !== undefined) updateData.photoIds = parsed.data.photoIds;
  if (parsed.data.responsibleContact !== undefined) updateData.responsibleContact = parsed.data.responsibleContact;
  if (parsed.data.deadline !== undefined) updateData.deadline = parsed.data.deadline;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.resolutionPhotoIds !== undefined) updateData.resolutionPhotoIds = parsed.data.resolutionPhotoIds;
  if (parsed.data.resolutionDate !== undefined) updateData.resolutionDate = parsed.data.resolutionDate;
  if (parsed.data.resolutionNotes !== undefined) updateData.resolutionNotes = parsed.data.resolutionNotes;
  if (parsed.data.verifiedBy !== undefined) updateData.verifiedBy = parsed.data.verifiedBy;

  // Auto-set resolution date when transitioning to fixed
  if (parsed.data.status === 'fixed' && existing.status !== 'fixed' && !parsed.data.resolutionDate) {
    updateData.resolutionDate = new Date().toISOString().split('T')[0];
  }

  // Auto-set verified info when transitioning to verified
  if (parsed.data.status === 'verified' && existing.status !== 'verified' && !parsed.data.verifiedBy) {
    updateData.verifiedBy = userId;
  }

  const [updated] = await db
    .update(snags)
    .set(updateData)
    .where(eq(snags.id, id))
    .returning();

  const statusChange = parsed.data.status && parsed.data.status !== existing.status
    ? ` (${existing.status} -> ${parsed.data.status})`
    : '';

  await logActivity(
    db,
    projectId,
    userId,
    'snags',
    'updated',
    'snag',
    id,
    `Updated snag: ${existing.title}${statusChange}`,
  );

  return c.json(updated);
});

// DELETE /snags/:id — delete snag (owner only)
snagRoutes.delete('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(snags)
    .where(and(eq(snags.id, id), eq(snags.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Snag not found' }, 404);

  await db.delete(snags).where(eq(snags.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'snags',
    'deleted',
    'snag',
    id,
    `Deleted snag: ${existing.title}`,
  );

  return c.json({ success: true });
});

export { snagRoutes };

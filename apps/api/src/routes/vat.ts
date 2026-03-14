import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { vatEntries } from '@buildtracker/db';
import { eq, and, asc, desc } from 'drizzle-orm';
import { createVATEntrySchema, updateVATEntrySchema } from '@buildtracker/shared';
import { getVATDashboard, createVATEntry, exportHMRC } from '../services/vat.service.js';
import { logActivity } from '../services/activity.service.js';

const vatRoutes = new Hono();

// GET /vat — dashboard summary
vatRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const dashboard = await getVATDashboard(db, projectId);
  return c.json(dashboard);
});

// GET /vat/entries — list all VAT entries
vatRoutes.get('/entries', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const reclaimableFilter = c.req.query('reclaimable');
  const validatedFilter = c.req.query('validated');

  let entries = await db
    .select()
    .from(vatEntries)
    .where(eq(vatEntries.projectId, projectId))
    .orderBy(desc(vatEntries.createdAt));

  if (reclaimableFilter) {
    entries = entries.filter((e) => e.reclaimable === reclaimableFilter);
  }
  if (validatedFilter !== undefined && validatedFilter !== null) {
    const isValidated = validatedFilter === 'true';
    entries = entries.filter((e) => e.validated === isValidated);
  }

  return c.json({ entries });
});

// POST /vat/entries — create VAT entry
vatRoutes.post('/entries', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createVATEntrySchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const result = await createVATEntry(db, projectId, parsed.data, userId);
  return c.json(result, 201);
});

// PATCH /vat/entries/:id — update VAT entry
vatRoutes.patch('/entries/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateVATEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(vatEntries)
    .where(and(eq(vatEntries.id, id), eq(vatEntries.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'VAT entry not found' }, 404);

  const [updated] = await db
    .update(vatEntries)
    .set(parsed.data)
    .where(eq(vatEntries.id, id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'vat',
    'updated',
    'vat_entry',
    id,
    `Updated VAT entry: ${existing.supplierName} - ${existing.description}`,
  );

  return c.json(updated);
});

// GET /vat/export — HMRC CSV export
vatRoutes.get('/export', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const csv = await exportHMRC(db, projectId);

  c.header('Content-Type', 'text/csv');
  c.header('Content-Disposition', 'attachment; filename="vat-reclaim-export.csv"');
  return c.body(csv);
});

export { vatRoutes };

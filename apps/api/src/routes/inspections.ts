import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { requireRole } from '../middleware/project-access.js';
import { createInspectionSchema, updateInspectionSchema } from '@buildtracker/shared';
import {
  listInspections,
  getInspection,
  updateInspection,
  createInspection,
} from '../services/inspections.service.js';

const inspectionRoutes = new Hono();

// GET /inspections — list all inspections
inspectionRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const result = await listInspections(db, projectId);
  return c.json(result);
});

// GET /inspections/:id — inspection detail
inspectionRoutes.get('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const id = c.req.param('id');
  const result = await getInspection(db, id);

  if (!result) return c.json({ error: 'Inspection not found' }, 404);
  return c.json(result);
});

// POST /inspections — create custom inspection (owner only)
inspectionRoutes.post('/', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createInspectionSchema.safeParse({ ...body, projectId, isCustom: true });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const result = await createInspection(
    db,
    {
      projectId,
      name: parsed.data.name,
      type: parsed.data.type,
      linkedTaskId: parsed.data.linkedTaskId,
      status: parsed.data.status,
      scheduledDate: parsed.data.scheduledDate,
      inspector: parsed.data.inspector,
      isCustom: true,
      sortOrder: parsed.data.sortOrder,
    },
    userId,
  );

  return c.json(result, 201);
});

// PATCH /inspections/:id — update inspection
inspectionRoutes.patch('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateInspectionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const result = await updateInspection(db, id, parsed.data, userId, projectId);

  if (!result) return c.json({ error: 'Inspection not found' }, 404);
  return c.json(result);
});

export { inspectionRoutes };

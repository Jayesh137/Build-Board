import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { requireRole } from '../middleware/project-access.js';
import { createTaskSchema } from '@buildtracker/shared';
import { listPhases, createTask } from '../services/tasks.service.js';

const phaseRoutes = new Hono();

// GET /phases — list all phases with nested tasks
phaseRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const result = await listPhases(db, projectId);
  return c.json(result);
});

// POST /phases/:phaseId/tasks — create task within a phase (owner only)
phaseRoutes.post('/:phaseId/tasks', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const phaseId = c.req.param('phaseId');

  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse({ ...body, phaseId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const task = await createTask(db, phaseId, parsed.data, userId, projectId);
  return c.json(task, 201);
});

export { phaseRoutes };

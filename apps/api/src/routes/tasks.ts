import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { requireRole } from '../middleware/project-access.js';
import { updateTaskSchema } from '@buildtracker/shared';
import { getTask, updateTask, deleteTask } from '../services/tasks.service.js';

const taskRoutes = new Hono();

// GET /tasks/:taskId — get task detail with dependencies
taskRoutes.get('/:taskId', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const taskId = c.req.param('taskId');
  const task = await getTask(db, taskId);

  if (!task) return c.json({ error: 'Task not found' }, 404);
  return c.json(task);
});

// PATCH /tasks/:taskId — update task
taskRoutes.patch('/:taskId', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const taskId = c.req.param('taskId');
  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const result = await updateTask(db, taskId, parsed.data, userId, projectId);

  if (!result) return c.json({ error: 'Task not found' }, 404);

  if ('code' in result && result.code === 'CIL_BLOCK') {
    return c.json({ error: result.error, code: result.code }, 409);
  }

  return c.json(result);
});

// DELETE /tasks/:taskId — delete task (owner only)
taskRoutes.delete('/:taskId', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const taskId = c.req.param('taskId');
  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const deleted = await deleteTask(db, taskId, userId, projectId);
  if (!deleted) return c.json({ error: 'Task not found' }, 404);

  return c.json({ success: true, deleted });
});

export { taskRoutes };

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { projects } from '@buildtracker/db';
import { eq } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';

const projectRoutes = new Hono();

// GET /projects/:projectId — get project details
projectRoutes.get('/', async (c) => {
  const projectId = c.get('projectId');
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return c.json({ error: 'Project not found' }, 404);

  return c.json(project);
});

// PATCH /projects/:projectId — update project settings (owner only)
projectRoutes.patch('/', requireRole('owner'), async (c) => {
  const projectId = c.get('projectId');
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const body = await c.req.json();
  const [updated] = await db
    .update(projects)
    .set(body)
    .where(eq(projects.id, projectId))
    .returning();

  return c.json(updated);
});

export { projectRoutes };

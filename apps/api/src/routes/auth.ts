import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { projects, projectMembers } from '@buildtracker/db';
import { eq } from 'drizzle-orm';

const authRoutes = new Hono();

// GET /auth/me — returns current user info + their projects
authRoutes.get('/me', async (c) => {
  const userId = c.get('userId');
  const userEmail = c.get('userEmail');

  if (!db) {
    return c.json({ userId, email: userEmail, projects: [] });
  }

  const memberships = await db
    .select({
      projectId: projectMembers.projectId,
      role: projectMembers.role,
      modules: projectMembers.modules,
      projectName: projects.name,
      projectAddress: projects.address,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId));

  return c.json({
    userId,
    email: userEmail,
    projects: memberships.map(m => ({
      id: m.projectId,
      name: m.projectName,
      address: m.projectAddress,
      role: m.role,
      modules: m.modules,
    })),
  });
});

export { authRoutes };

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { projects, projectMembers, seedProject } from '@buildtracker/db';
import { eq } from 'drizzle-orm';

const setupRoutes = new Hono();

// GET /setup — check if the user has any projects
setupRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const userId = c.get('userId');

  const memberships = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));

  if (memberships.length === 0) {
    return c.json([]);
  }

  const projectIds = memberships.map((m) => m.projectId).filter(Boolean) as string[];

  const userProjects = [];
  for (const pid of projectIds) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, pid))
      .limit(1);
    if (project) userProjects.push(project);
  }

  return c.json(userProjects);
});

// POST /setup — create a new project, add user as owner, seed project data
setupRoutes.post('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const userId = c.get('userId');
  const body = await c.req.json();

  const { name, address, totalBudget, targetCompletion } = body;

  if (!name || !address) {
    return c.json({ error: 'Name and address are required' }, 400);
  }

  // Check if user already has a project
  const existing = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'User already has a project' }, 409);
  }

  // Create the project
  const [project] = await db
    .insert(projects)
    .values({
      name,
      address,
      totalBudget: totalBudget ?? null,
      targetCompletion: targetCompletion ?? null,
      startDate: new Date().toISOString().split('T')[0],
    })
    .returning();

  // Add user as owner
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId,
    role: 'owner',
    acceptedAt: new Date(),
  });

  // Seed project with phases, tasks, budget categories, inspections, etc.
  // Type cast needed: API db has schema type param, seedProject expects plain instance
  await seedProject(db as any, project.id);

  return c.json(project, 201);
});

export { setupRoutes };

import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { budgetEntries, budgetCategories } from '@buildtracker/db';
import { eq, and, asc, desc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createBudgetEntrySchema, updateBudgetEntrySchema } from '@buildtracker/shared';
import { getBudgetOverview, createEntry } from '../services/budget.service.js';
import { logActivity } from '../services/activity.service.js';

const budgetRoutes = new Hono();

// GET /budget — overview with categories and totals
budgetRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const overview = await getBudgetOverview(db, projectId);
  return c.json(overview);
});

// GET /budget/entries — list entries with optional filters
budgetRoutes.get('/entries', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const typeFilter = c.req.query('type');
  const categoryFilter = c.req.query('category');
  const statusFilter = c.req.query('status');

  // Get all categories for this project to filter entries
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.projectId, projectId));

  const categoryIds = categories.map((cat) => cat.id);

  if (categoryIds.length === 0) {
    return c.json({ entries: [] });
  }

  // Fetch all entries for project categories
  let allEntries: any[] = [];
  for (const catId of categoryIds) {
    const entries = await db
      .select()
      .from(budgetEntries)
      .where(eq(budgetEntries.categoryId, catId))
      .orderBy(desc(budgetEntries.createdAt));
    allEntries.push(...entries);
  }

  // Apply filters
  if (typeFilter) {
    allEntries = allEntries.filter((e) => e.type === typeFilter);
  }
  if (categoryFilter) {
    allEntries = allEntries.filter((e) => e.categoryId === categoryFilter);
  }
  if (statusFilter) {
    allEntries = allEntries.filter((e) => e.status === statusFilter);
  }

  // Sort by date descending
  allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return c.json({ entries: allEntries });
});

// POST /budget/entries — create entry (owner only)
budgetRoutes.post('/entries', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createBudgetEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify category belongs to this project
  const [category] = await db
    .select()
    .from(budgetCategories)
    .where(
      and(
        eq(budgetCategories.id, parsed.data.categoryId),
        eq(budgetCategories.projectId, projectId),
      ),
    )
    .limit(1);

  if (!category) {
    return c.json({ error: 'Category not found in this project' }, 404);
  }

  const entry = await createEntry(db, parsed.data.categoryId, parsed.data, userId, projectId);
  return c.json(entry, 201);
});

// PATCH /budget/entries/:id — update entry
budgetRoutes.patch('/entries/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateBudgetEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Verify entry belongs to this project (through category)
  const [existing] = await db
    .select()
    .from(budgetEntries)
    .where(eq(budgetEntries.id, id))
    .limit(1);

  if (!existing) return c.json({ error: 'Entry not found' }, 404);

  const [category] = await db
    .select()
    .from(budgetCategories)
    .where(
      and(
        eq(budgetCategories.id, existing.categoryId!),
        eq(budgetCategories.projectId, projectId),
      ),
    )
    .limit(1);

  if (!category) return c.json({ error: 'Entry not found in this project' }, 404);

  const [updated] = await db
    .update(budgetEntries)
    .set(parsed.data)
    .where(eq(budgetEntries.id, id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'budget',
    'updated',
    'budget_entry',
    id,
    `Updated budget entry: ${existing.description ?? existing.supplier ?? id}`,
  );

  return c.json(updated);
});

// DELETE /budget/entries/:id — delete entry (owner only)
budgetRoutes.delete('/entries/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  // Verify entry belongs to this project
  const [existing] = await db
    .select()
    .from(budgetEntries)
    .where(eq(budgetEntries.id, id))
    .limit(1);

  if (!existing) return c.json({ error: 'Entry not found' }, 404);

  const [category] = await db
    .select()
    .from(budgetCategories)
    .where(
      and(
        eq(budgetCategories.id, existing.categoryId!),
        eq(budgetCategories.projectId, projectId),
      ),
    )
    .limit(1);

  if (!category) return c.json({ error: 'Entry not found in this project' }, 404);

  await db.delete(budgetEntries).where(eq(budgetEntries.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'budget',
    'deleted',
    'budget_entry',
    id,
    `Deleted budget entry: ${existing.description ?? existing.supplier ?? id}`,
  );

  return c.json({ success: true });
});

export { budgetRoutes };

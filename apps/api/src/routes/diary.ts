import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { diaryEntries } from '@buildtracker/db';
import { eq, and, desc } from 'drizzle-orm';
import { createDiaryEntrySchema, updateDiaryEntrySchema } from '@buildtracker/shared';
import { logActivity } from '../services/activity.service.js';

const diaryRoutes = new Hono();

// GET /diary — list diary entries ordered by date desc
diaryRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');

  const entries = await db
    .select()
    .from(diaryEntries)
    .where(eq(diaryEntries.projectId, projectId))
    .orderBy(desc(diaryEntries.entryDate));

  return c.json({ entries });
});

// POST /diary — create entry (check for duplicate date)
diaryRoutes.post('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createDiaryEntrySchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  // Check for duplicate date (unique per project+date)
  const [existingEntry] = await db
    .select()
    .from(diaryEntries)
    .where(
      and(
        eq(diaryEntries.projectId, projectId),
        eq(diaryEntries.entryDate, parsed.data.entryDate),
      ),
    )
    .limit(1);

  if (existingEntry) {
    return c.json({
      error: `A diary entry already exists for ${parsed.data.entryDate}`,
      code: 'DUPLICATE_DATE',
    }, 409);
  }

  const [created] = await db
    .insert(diaryEntries)
    .values({
      projectId,
      entryDate: parsed.data.entryDate,
      weatherTemp: parsed.data.weatherTemp ?? null,
      weatherConditions: parsed.data.weatherConditions ?? null,
      weatherWind: parsed.data.weatherWind ?? null,
      workersOnSite: parsed.data.workersOnSite ?? null,
      workCompleted: parsed.data.workCompleted ?? null,
      issues: parsed.data.issues ?? null,
      deliveries: parsed.data.deliveries ?? null,
      visitors: parsed.data.visitors ?? null,
      healthSafety: parsed.data.healthSafety ?? null,
      notes: parsed.data.notes ?? null,
      createdBy: userId,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'diary',
    'created',
    'diary_entry',
    created.id,
    `Created diary entry for ${parsed.data.entryDate}`,
  );

  return c.json(created, 201);
});

// GET /diary/:date — get entry by date (format YYYY-MM-DD)
diaryRoutes.get('/:date', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const date = c.req.param('date');

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  const [entry] = await db
    .select()
    .from(diaryEntries)
    .where(
      and(
        eq(diaryEntries.projectId, projectId),
        eq(diaryEntries.entryDate, date),
      ),
    )
    .limit(1);

  if (!entry) return c.json({ error: 'Diary entry not found for this date' }, 404);

  return c.json(entry);
});

// PATCH /diary/:date — update entry
diaryRoutes.patch('/:date', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const date = c.req.param('date');

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }

  const body = await c.req.json();
  const parsed = updateDiaryEntrySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(diaryEntries)
    .where(
      and(
        eq(diaryEntries.projectId, projectId),
        eq(diaryEntries.entryDate, date),
      ),
    )
    .limit(1);

  if (!existing) return c.json({ error: 'Diary entry not found for this date' }, 404);

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (parsed.data.entryDate !== undefined) updateData.entryDate = parsed.data.entryDate;
  if (parsed.data.weatherTemp !== undefined) updateData.weatherTemp = parsed.data.weatherTemp;
  if (parsed.data.weatherConditions !== undefined) updateData.weatherConditions = parsed.data.weatherConditions;
  if (parsed.data.weatherWind !== undefined) updateData.weatherWind = parsed.data.weatherWind;
  if (parsed.data.workersOnSite !== undefined) updateData.workersOnSite = parsed.data.workersOnSite;
  if (parsed.data.workCompleted !== undefined) updateData.workCompleted = parsed.data.workCompleted;
  if (parsed.data.issues !== undefined) updateData.issues = parsed.data.issues;
  if (parsed.data.deliveries !== undefined) updateData.deliveries = parsed.data.deliveries;
  if (parsed.data.visitors !== undefined) updateData.visitors = parsed.data.visitors;
  if (parsed.data.healthSafety !== undefined) updateData.healthSafety = parsed.data.healthSafety;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [updated] = await db
    .update(diaryEntries)
    .set(updateData)
    .where(eq(diaryEntries.id, existing.id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'diary',
    'updated',
    'diary_entry',
    existing.id,
    `Updated diary entry for ${date}`,
  );

  return c.json(updated);
});

export { diaryRoutes };

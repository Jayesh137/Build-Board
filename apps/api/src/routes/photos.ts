import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { photos } from '@buildtracker/db';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createPhoto, listPhotos } from '../services/photos.service.js';
import { logActivity } from '../services/activity.service.js';

const photoRoutes = new Hono();

// GET /photos — list photos with filters, paginated
photoRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');

  const room = c.req.query('room');
  const phase = c.req.query('phase');
  const trade = c.req.query('trade');
  const photoType = c.req.query('type');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

  const result = await listPhotos(db, projectId, {
    room: room ?? undefined,
    phase: phase ?? undefined,
    trade: trade ?? undefined,
    photoType: photoType ?? undefined,
    limit,
    offset,
  });

  return c.json(result);
});

// POST /photos — create photo record
photoRoutes.post('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();

  if (!body.filePath) {
    return c.json({ error: 'Validation failed', details: 'filePath is required' }, 400);
  }

  const created = await createPhoto(
    db,
    projectId,
    {
      filePath: body.filePath,
      thumbnailPath: body.thumbnailPath,
      takenAt: body.takenAt,
      room: body.room,
      phase: body.phase,
      trade: body.trade,
      photoType: body.photoType,
      tags: body.tags,
      diaryEntryId: body.diaryEntryId,
    },
    userId,
  );

  return c.json(created, 201);
});

// DELETE /photos/:id — delete photo (owner only)
photoRoutes.delete('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(photos)
    .where(and(eq(photos.id, id), eq(photos.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Photo not found' }, 404);

  await db.delete(photos).where(eq(photos.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'photos',
    'deleted',
    'photo',
    id,
    `Deleted photo: ${existing.filePath}`,
  );

  return c.json({ success: true });
});

export { photoRoutes };

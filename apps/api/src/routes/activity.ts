import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { activityLog } from '@buildtracker/db';
import { eq, desc } from 'drizzle-orm';

const activityRoutes = new Hono();

// GET /activity — paginated activity log for the project
activityRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const entries = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.projectId, projectId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    activity: entries,
    pagination: {
      limit,
      offset,
      count: entries.length,
      hasMore: entries.length === limit,
    },
  });
});

export { activityRoutes };

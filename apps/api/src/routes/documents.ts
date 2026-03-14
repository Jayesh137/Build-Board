import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { documents } from '@buildtracker/db';
import { eq, and, desc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { upload, getRequiredDocuments } from '../services/documents.service.js';
import { logActivity } from '../services/activity.service.js';

const documentRoutes = new Hono();

// GET /documents/required — get required documents checklist
// (must be before /:id to avoid matching "required" as an id)
documentRoutes.get('/required', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const result = await getRequiredDocuments(db, projectId);
  return c.json(result);
});

// GET /documents — list documents, filterable by folder and tags
documentRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const folderFilter = c.req.query('folder');
  const tagsFilter = c.req.query('tags'); // comma-separated

  let allDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.projectId, projectId))
    .orderBy(desc(documents.uploadedAt));

  // Apply folder filter
  if (folderFilter) {
    allDocs = allDocs.filter((d) => d.folder === folderFilter);
  }

  // Apply tags filter (any match)
  if (tagsFilter) {
    const filterTags = tagsFilter.split(',').map((t) => t.trim().toLowerCase());
    allDocs = allDocs.filter((d) => {
      if (!d.tags || d.tags.length === 0) return false;
      return d.tags.some((tag) => filterTags.includes(tag.toLowerCase()));
    });
  }

  // Group by folder
  const grouped: Record<string, typeof allDocs> = {};
  for (const doc of allDocs) {
    if (!grouped[doc.folder]) grouped[doc.folder] = [];
    grouped[doc.folder].push(doc);
  }

  return c.json({ documents: allDocs, grouped });
});

// POST /documents — create document record
documentRoutes.post('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();

  const { folder, name, filePath, fileSize, mimeType, tags } = body;

  if (!folder || !name || !filePath || !fileSize || !mimeType) {
    return c.json({
      error: 'Validation failed',
      details: 'Required fields: folder, name, filePath, fileSize, mimeType',
    }, 400);
  }

  const result = await upload(
    db,
    projectId,
    folder,
    name,
    filePath,
    fileSize,
    mimeType,
    tags ?? null,
    userId,
  );

  if ('code' in result) {
    return c.json({ error: result.error, code: result.code }, 400);
  }

  return c.json(result, 201);
});

// GET /documents/:id — get document detail
documentRoutes.get('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const id = c.req.param('id');

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.projectId, projectId)))
    .limit(1);

  if (!doc) return c.json({ error: 'Document not found' }, 404);

  return c.json(doc);
});

// DELETE /documents/:id — delete document (owner only)
documentRoutes.delete('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Document not found' }, 404);

  await db.delete(documents).where(eq(documents.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'documents',
    'deleted',
    'document',
    id,
    `Deleted document: ${existing.name}`,
  );

  return c.json({ success: true });
});

export { documentRoutes };

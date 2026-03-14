import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from './middleware/logger.js';
import { auth } from './middleware/auth.js';
import { projectAccess } from './middleware/project-access.js';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { phaseRoutes } from './routes/phases.js';
import { taskRoutes } from './routes/tasks.js';
import { contactRoutes } from './routes/contacts.js';
import { budgetRoutes } from './routes/budget.js';
import { vatRoutes } from './routes/vat.js';
import { planningRoutes } from './routes/planning.js';
import { inspectionRoutes } from './routes/inspections.js';
import { decisionRoutes } from './routes/decisions.js';
import { documentRoutes } from './routes/documents.js';
import { diaryRoutes } from './routes/diary.js';
import { photoRoutes } from './routes/photos.js';
import { snagRoutes } from './routes/snags.js';
import { alertRoutes } from './routes/alerts.js';
import { activityRoutes } from './routes/activity.js';
import { setupRoutes } from './routes/setup.js';
import { startScheduler } from './jobs/scheduler.js';
import { db } from './lib/db.js';
import { snags } from '@buildtracker/db';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Global middleware
app.use('*', logger);

// CORS (for future direct API access from mobile/other clients)
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
}));

// Health check (no auth)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Public snag share endpoint (no auth required — must be before auth middleware)
app.get('/api/v1/snags/share/:token', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const token = c.req.param('token');

  const matchingSnags = await db
    .select()
    .from(snags)
    .where(eq(snags.shareToken, token));

  if (matchingSnags.length === 0) {
    return c.json({ error: 'Invalid or expired share link' }, 404);
  }

  // All snags with this token belong to the same project
  const projectId = matchingSnags[0].projectId;

  // Return all snags for this project that have this share token
  // Strip sensitive fields for the public view
  const publicSnags = matchingSnags.map((snag) => ({
    id: snag.id,
    title: snag.title,
    room: snag.room,
    category: snag.category,
    severity: snag.severity,
    description: snag.description,
    photoIds: snag.photoIds,
    dateFound: snag.dateFound,
    deadline: snag.deadline,
    status: snag.status,
    resolutionPhotoIds: snag.resolutionPhotoIds,
    resolutionDate: snag.resolutionDate,
    resolutionNotes: snag.resolutionNotes,
    createdAt: snag.createdAt,
  }));

  return c.json({ projectId, snags: publicSnags });
});

// Auth routes
app.route('/auth', authRoutes);

// Setup routes
app.route('/api/v1/setup', setupRoutes);

// Project-scoped routes (no auth required for personal use)
const projectScoped = new Hono();
// Set default project context for all project-scoped routes
projectScoped.use('*', async (c, next) => {
  const projectId = c.req.param('projectId');
  c.set('projectId', projectId);
  c.set('userId', 'owner');
  c.set('memberRole', 'owner');
  c.set('memberModules', null);
  await next();
});
projectScoped.route('/', projectRoutes);
projectScoped.route('/phases', phaseRoutes);
projectScoped.route('/tasks', taskRoutes);
projectScoped.route('/contacts', contactRoutes);
projectScoped.route('/budget', budgetRoutes);
projectScoped.route('/vat', vatRoutes);
projectScoped.route('/planning', planningRoutes);
projectScoped.route('/inspections', inspectionRoutes);
projectScoped.route('/decisions', decisionRoutes);
projectScoped.route('/documents', documentRoutes);
projectScoped.route('/diary', diaryRoutes);
projectScoped.route('/photos', photoRoutes);
projectScoped.route('/snags', snagRoutes);
projectScoped.route('/alerts', alertRoutes);
projectScoped.route('/activity', activityRoutes);

// Mount project-scoped routes
app.route('/api/v1/projects/:projectId', projectScoped);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3001', 10);
console.log(`BuildTracker API starting on port ${port}...`);
serve({ fetch: app.fetch, port }, () => {
  console.log(`BuildTracker API running at http://localhost:${port}`);
  startScheduler();
});

export default app;

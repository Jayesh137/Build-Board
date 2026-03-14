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

const app = new Hono();

// Global middleware
app.use('*', logger);

// CORS (for future direct API access from mobile/other clients)
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
}));

// Health check (no auth)
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth routes (require auth but not project access)
app.use('/auth/*', auth);
app.route('/auth', authRoutes);

// Project-scoped routes (require auth + project membership)
const projectScoped = new Hono();
projectScoped.use('*', auth);
projectScoped.use('*', projectAccess);
projectScoped.route('/', projectRoutes);
projectScoped.route('/phases', phaseRoutes);
projectScoped.route('/tasks', taskRoutes);
projectScoped.route('/contacts', contactRoutes);
projectScoped.route('/budget', budgetRoutes);
projectScoped.route('/vat', vatRoutes);
projectScoped.route('/planning', planningRoutes);
projectScoped.route('/inspections', inspectionRoutes);

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
});

export default app;

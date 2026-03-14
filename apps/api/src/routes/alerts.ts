import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { computeAlerts } from '../services/alerts.service.js';

const alertRoutes = new Hono();

// GET /alerts — compute and return prioritised alerts for the project
alertRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const alerts = await computeAlerts(db, projectId);

  return c.json({
    alerts,
    counts: {
      critical: alerts.filter((a) => a.priority === 'critical').length,
      warning: alerts.filter((a) => a.priority === 'warning').length,
      info: alerts.filter((a) => a.priority === 'info').length,
      total: alerts.length,
    },
  });
});

export { alertRoutes };

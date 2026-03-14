import { Hono } from 'hono';
import { db } from '../lib/db.js';
import { contacts } from '@buildtracker/db';
import { eq, and, asc, desc } from 'drizzle-orm';
import { requireRole } from '../middleware/project-access.js';
import { createContactSchema, updateContactSchema } from '@buildtracker/shared';
import { logActivity } from '../services/activity.service.js';

const contactRoutes = new Hono();

// GET /contacts — list contacts (pinned first, grouped by role)
contactRoutes.get('/', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');

  const allContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.projectId, projectId))
    .orderBy(desc(contacts.isPinned), asc(contacts.role), asc(contacts.name));

  // Group by role
  const grouped: Record<string, typeof allContacts> = {};
  for (const contact of allContacts) {
    const role = contact.role ?? 'Other';
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(contact);
  }

  // Hide contractValue from non-owners
  const memberRole = c.get('memberRole');
  if (memberRole !== 'owner') {
    for (const contact of allContacts) {
      (contact as any).contractValue = undefined;
    }
  }

  return c.json({ contacts: allContacts, grouped });
});

// POST /contacts — create contact (owner only)
contactRoutes.post('/', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');

  const body = await c.req.json();
  const parsed = createContactSchema.safeParse({ ...body, projectId });

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(contacts)
    .values({
      projectId,
      name: parsed.data.name,
      role: parsed.data.role ?? null,
      company: parsed.data.company ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
      address: parsed.data.address ?? null,
      website: parsed.data.website ?? null,
      notes: parsed.data.notes ?? null,
      insuranceExpiry: parsed.data.insuranceExpiry ?? null,
      qualifications: parsed.data.qualifications ?? null,
      contractValue: parsed.data.contractValue ?? null,
      rating: parsed.data.rating ?? null,
      isPinned: parsed.data.isPinned ?? false,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'contacts',
    'created',
    'contact',
    created.id,
    `Created contact: ${parsed.data.name}`,
  );

  return c.json(created, 201);
});

// GET /contacts/:id — contact detail
contactRoutes.get('/:id', async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const id = c.req.param('id');

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.projectId, projectId)))
    .limit(1);

  if (!contact) return c.json({ error: 'Contact not found' }, 404);

  // Hide contractValue from non-owners
  const memberRole = c.get('memberRole');
  if (memberRole !== 'owner') {
    (contact as any).contractValue = undefined;
  }

  return c.json(contact);
});

// PATCH /contacts/:id — update contact (owner only)
contactRoutes.patch('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const body = await c.req.json();
  const parsed = updateContactSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Contact not found' }, 404);

  const [updated] = await db
    .update(contacts)
    .set(parsed.data)
    .where(eq(contacts.id, id))
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'contacts',
    'updated',
    'contact',
    id,
    `Updated contact: ${existing.name}`,
  );

  return c.json(updated);
});

// DELETE /contacts/:id — delete contact (owner only)
contactRoutes.delete('/:id', requireRole('owner'), async (c) => {
  if (!db) return c.json({ error: 'Database not configured' }, 503);

  const projectId = c.get('projectId');
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.projectId, projectId)))
    .limit(1);

  if (!existing) return c.json({ error: 'Contact not found' }, 404);

  await db.delete(contacts).where(eq(contacts.id, id));

  await logActivity(
    db,
    projectId,
    userId,
    'contacts',
    'deleted',
    'contact',
    id,
    `Deleted contact: ${existing.name}`,
  );

  return c.json({ success: true });
});

export { contactRoutes };

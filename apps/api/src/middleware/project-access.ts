import type { MiddlewareHandler } from 'hono';
import { db } from '../lib/db.js';
import { projectMembers } from '@buildtracker/db';
import { eq, and } from 'drizzle-orm';

declare module 'hono' {
  interface ContextVariableMap {
    projectId: string;
    memberRole: 'owner' | 'collaborator' | 'viewer';
    memberModules: string[] | null;
  }
}

export const projectAccess: MiddlewareHandler = async (c, next) => {
  const projectId = c.req.param('projectId');
  if (!projectId) {
    return c.json({ error: 'Project ID required' }, 400);
  }

  if (!db) {
    return c.json({ error: 'Database not configured' }, 503);
  }

  const userId = c.get('userId');

  const [member] = await db
    .select()
    .from(projectMembers)
    .where(and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ))
    .limit(1);

  if (!member) {
    return c.json({ error: 'Not a member of this project' }, 403);
  }

  c.set('projectId', projectId);
  c.set('memberRole', member.role as 'owner' | 'collaborator' | 'viewer');
  c.set('memberModules', member.modules);
  await next();
};

// Helper middleware factory: require specific roles
export function requireRole(...roles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const memberRole = c.get('memberRole');
    if (!roles.includes(memberRole)) {
      return c.json({ error: `Requires role: ${roles.join(' or ')}` }, 403);
    }
    await next();
  };
}

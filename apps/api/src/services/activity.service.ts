import { activityLog } from '@buildtracker/db';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function logActivity(
  db: PostgresJsDatabase<any>,
  projectId: string,
  userId: string,
  module: string,
  action: string,
  entityType?: string,
  entityId?: string,
  summary?: string,
): Promise<void> {
  await db.insert(activityLog).values({
    projectId,
    userId,
    module,
    action,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    summary: summary ?? null,
  });
}

import { photos } from '@buildtracker/db';
import { eq, and, desc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── Create Photo ──────────────────────────────────────────────────────────

export async function createPhoto(
  db: PostgresJsDatabase<any>,
  projectId: string,
  data: {
    filePath: string;
    thumbnailPath?: string;
    takenAt?: string;
    room?: string;
    phase?: string;
    trade?: string;
    photoType?: string;
    tags?: string[];
    diaryEntryId?: string;
  },
  userId: string,
) {
  const [created] = await db
    .insert(photos)
    .values({
      projectId,
      filePath: data.filePath,
      thumbnailPath: data.thumbnailPath ?? null,
      takenAt: data.takenAt ? new Date(data.takenAt) : new Date(),
      room: data.room ?? null,
      phase: data.phase ?? null,
      trade: data.trade ?? null,
      photoType: data.photoType ?? null,
      tags: data.tags ?? null,
      diaryEntryId: data.diaryEntryId ?? null,
      uploadedBy: userId,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'photos',
    'created',
    'photo',
    created.id,
    `Uploaded photo: ${data.filePath}`,
  );

  return created;
}

// ─── List Photos (filterable, paginated) ───────────────────────────────────

export async function listPhotos(
  db: PostgresJsDatabase<any>,
  projectId: string,
  filters: {
    room?: string;
    phase?: string;
    trade?: string;
    photoType?: string;
    limit?: number;
    offset?: number;
  },
) {
  const pageLimit = filters.limit ?? 50;
  const pageOffset = filters.offset ?? 0;

  // Fetch all photos for this project
  let allPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.projectId, projectId))
    .orderBy(desc(photos.takenAt));

  // Apply filters
  if (filters.room) {
    allPhotos = allPhotos.filter((p) => p.room === filters.room);
  }
  if (filters.phase) {
    allPhotos = allPhotos.filter((p) => p.phase === filters.phase);
  }
  if (filters.trade) {
    allPhotos = allPhotos.filter((p) => p.trade === filters.trade);
  }
  if (filters.photoType) {
    allPhotos = allPhotos.filter((p) => p.photoType === filters.photoType);
  }

  const total = allPhotos.length;
  const paginated = allPhotos.slice(pageOffset, pageOffset + pageLimit);

  return {
    photos: paginated,
    pagination: {
      total,
      limit: pageLimit,
      offset: pageOffset,
      hasMore: pageOffset + pageLimit < total,
    },
  };
}

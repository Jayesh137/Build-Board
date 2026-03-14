import { documents } from '@buildtracker/db';
import { eq, and } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── Allowed File Types ────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'jpg', 'jpeg', 'png', 'webp',
  'dwg', 'dxf',
];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/acad',
  'application/dxf',
  'image/vnd.dwg',
  'image/vnd.dxf',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// ─── Required Documents ────────────────────────────────────────────────────

const REQUIRED_DOCUMENTS = [
  'Site Insurance Certificate',
  'Gas Safe Certificate',
  'Electrical Certificate',
  'Building Control Completion Certificate',
  'Warranty Certificate',
  'Planning Permission Decision',
  'Building Regulations Approval',
  'Party Wall Agreement',
  'Structural Engineer Calcs',
  'SAP Assessment',
];

// ─── Upload ────────────────────────────────────────────────────────────────

export async function upload(
  db: PostgresJsDatabase<any>,
  projectId: string,
  folder: string,
  name: string,
  filePath: string,
  fileSize: number,
  mimeType: string,
  tags: string[] | null,
  userId: string,
) {
  // Validate file extension
  const extension = filePath.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      error: `File type ".${extension}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      code: 'INVALID_FILE_TYPE',
    };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      error: `MIME type "${mimeType}" is not allowed`,
      code: 'INVALID_MIME_TYPE',
    };
  }

  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      error: `File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds the 20MB limit`,
      code: 'FILE_TOO_LARGE',
    };
  }

  const [created] = await db
    .insert(documents)
    .values({
      projectId,
      folder,
      name,
      filePath,
      fileSize,
      mimeType,
      tags: tags ?? null,
      uploadedBy: userId,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'documents',
    'created',
    'document',
    created.id,
    `Uploaded document: ${name}`,
  );

  return created;
}

// ─── Get Signed URL (placeholder) ──────────────────────────────────────────

export async function getSignedUrl(docId: string): Promise<string> {
  // Placeholder for Supabase Storage signed URL generation.
  // In production, this would call:
  //   const { data } = await supabase.storage
  //     .from('documents')
  //     .createSignedUrl(filePath, 3600);
  //   return data.signedUrl;
  return `https://placeholder.supabase.co/storage/v1/object/sign/documents/${docId}?token=placeholder`;
}

// ─── Get Required Documents ────────────────────────────────────────────────

export async function getRequiredDocuments(
  db: PostgresJsDatabase<any>,
  projectId: string,
) {
  // Get all documents for this project
  const projectDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.projectId, projectId));

  // Check each required document against uploaded documents
  const result = REQUIRED_DOCUMENTS.map((docName) => {
    const matchingDoc = projectDocs.find(
      (d) => d.name.toLowerCase() === docName.toLowerCase(),
    );

    return {
      name: docName,
      uploaded: !!matchingDoc,
      document: matchingDoc ?? null,
    };
  });

  const uploadedCount = result.filter((r) => r.uploaded).length;

  return {
    required: result,
    summary: {
      total: REQUIRED_DOCUMENTS.length,
      uploaded: uploadedCount,
      missing: REQUIRED_DOCUMENTS.length - uploadedCount,
      completionPct: Math.round((uploadedCount / REQUIRED_DOCUMENTS.length) * 100),
    },
  };
}

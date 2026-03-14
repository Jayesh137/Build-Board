import { vatEntries } from '@buildtracker/db';
import { classifyVAT, validateVATInvoice } from '@buildtracker/shared';
import { eq, and, asc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── VAT Dashboard ──────────────────────────────────────────────────────────

export async function getVATDashboard(db: PostgresJsDatabase<any>, projectId: string) {
  const entries = await db
    .select()
    .from(vatEntries)
    .where(eq(vatEntries.projectId, projectId))
    .orderBy(asc(vatEntries.createdAt));

  const reclaimableEntries = entries.filter((e) => e.reclaimable === 'yes');
  const needsReviewEntries = entries.filter((e) => e.reclaimable === 'needs_review');
  const nonReclaimableEntries = entries.filter((e) => e.reclaimable === 'no');
  const validatedEntries = reclaimableEntries.filter((e) => e.validated);

  const totalReclaimable = reclaimableEntries.reduce((sum, e) => sum + e.vatAmount, 0);
  const totalValidated = validatedEntries.reduce((sum, e) => sum + e.vatAmount, 0);
  const totalVAT = entries.reduce((sum, e) => sum + e.vatAmount, 0);

  // HMRC deadline is 3 months after completion - provide info
  return {
    totalVAT,
    totalReclaimable,
    totalValidated,
    counts: {
      total: entries.length,
      reclaimable: reclaimableEntries.length,
      needsReview: needsReviewEntries.length,
      nonReclaimable: nonReclaimableEntries.length,
      validated: validatedEntries.length,
    },
    readyToSubmit: validatedEntries.length,
  };
}

// ─── Create VAT Entry ───────────────────────────────────────────────────────

export async function createVATEntry(
  db: PostgresJsDatabase<any>,
  projectId: string,
  data: {
    budgetEntryId?: string;
    invoiceNumber?: string;
    supplierName: string;
    supplierVatNumber?: string;
    description: string;
    netAmount: number;
    vatAmount: number;
    invoiceTotal: number;
    invoiceDate: string;
    source: string;
    reclaimable?: string;
    hasClaimantNameAddress?: boolean;
    receiptPath?: string;
    notes?: string;
  },
  userId: string,
) {
  // Auto-classify reclaimability
  const autoClassification = classifyVAT(data.description);
  const reclaimable = data.reclaimable ?? autoClassification;

  // Validate invoice
  const warnings = validateVATInvoice({
    invoiceTotal: data.invoiceTotal,
    hasClaimantNameAddress: data.hasClaimantNameAddress ?? false,
    source: data.source,
  });

  const [entry] = await db
    .insert(vatEntries)
    .values({
      projectId,
      budgetEntryId: data.budgetEntryId ?? null,
      invoiceNumber: data.invoiceNumber ?? null,
      supplierName: data.supplierName,
      supplierVatNumber: data.supplierVatNumber ?? null,
      description: data.description,
      netAmount: data.netAmount,
      vatAmount: data.vatAmount,
      invoiceTotal: data.invoiceTotal,
      invoiceDate: data.invoiceDate,
      source: data.source,
      reclaimable,
      hasClaimantNameAddress: data.hasClaimantNameAddress ?? null,
      receiptPath: data.receiptPath ?? null,
      notes: data.notes ?? null,
    })
    .returning();

  await logActivity(
    db,
    projectId,
    userId,
    'vat',
    'created',
    'vat_entry',
    entry.id,
    `Created VAT entry: ${data.supplierName} - ${data.description}`,
  );

  return { entry, warnings, autoClassification };
}

// ─── Export HMRC CSV ────────────────────────────────────────────────────────

export async function exportHMRC(db: PostgresJsDatabase<any>, projectId: string) {
  const entries = await db
    .select()
    .from(vatEntries)
    .where(
      and(
        eq(vatEntries.projectId, projectId),
        eq(vatEntries.reclaimable, 'yes'),
        eq(vatEntries.validated, true),
      ),
    )
    .orderBy(asc(vatEntries.invoiceDate));

  // CSV header
  const header = [
    'Invoice Number',
    'Supplier Name',
    'Supplier VAT Number',
    'Description',
    'Net Amount (pence)',
    'VAT Amount (pence)',
    'Invoice Total (pence)',
    'Invoice Date',
    'Source',
  ].join(',');

  const rows = entries.map((e) =>
    [
      csvEscape(e.invoiceNumber ?? ''),
      csvEscape(e.supplierName),
      csvEscape(e.supplierVatNumber ?? ''),
      csvEscape(e.description),
      e.netAmount,
      e.vatAmount,
      e.invoiceTotal,
      e.invoiceDate,
      csvEscape(e.source),
    ].join(','),
  );

  return [header, ...rows].join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

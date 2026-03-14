import {
  budgetCategories,
  budgetEntries,
  vatEntries,
} from '@buildtracker/db';
import { eq, and, sql, asc } from 'drizzle-orm';
import { logActivity } from './activity.service.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// ─── Budget Overview ────────────────────────────────────────────────────────

export async function getBudgetOverview(db: PostgresJsDatabase<any>, projectId: string) {
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.projectId, projectId))
    .orderBy(asc(budgetCategories.sortOrder));

  const categoriesWithTotals = await Promise.all(
    categories.map(async (cat) => {
      const entries = await db
        .select()
        .from(budgetEntries)
        .where(eq(budgetEntries.categoryId, cat.id));

      const quotes = entries.filter((e) => e.type === 'quote' && e.status === 'accepted');
      const invoices = entries.filter((e) => e.type === 'invoice');
      const payments = entries.filter((e) => e.type === 'payment');

      const committed = quotes.reduce((sum, e) => sum + e.amount, 0);
      const invoiced = invoices.reduce((sum, e) => sum + e.amount, 0);
      const paid = payments.reduce((sum, e) => sum + e.amount, 0);
      const spent = paid;
      const allocated = cat.allocatedAmount ?? 0;
      const remaining = allocated - Math.max(committed, spent);

      return {
        ...cat,
        committed,
        invoiced,
        spent,
        remaining,
        entryCount: entries.length,
      };
    }),
  );

  const totals = categoriesWithTotals.reduce(
    (acc, cat) => ({
      allocated: acc.allocated + (cat.allocatedAmount ?? 0),
      committed: acc.committed + cat.committed,
      invoiced: acc.invoiced + cat.invoiced,
      spent: acc.spent + cat.spent,
      remaining: acc.remaining + cat.remaining,
    }),
    { allocated: 0, committed: 0, invoiced: 0, spent: 0, remaining: 0 },
  );

  return {
    categories: categoriesWithTotals,
    totals,
  };
}

// ─── Create Budget Entry ────────────────────────────────────────────────────

export async function createEntry(
  db: PostgresJsDatabase<any>,
  categoryId: string,
  data: {
    type: string;
    supplier?: string;
    description?: string;
    amount: number;
    vatAmount?: number;
    date: string;
    status?: string;
    receiptPath?: string;
    linkedQuoteId?: string;
    notes?: string;
  },
  userId: string,
  projectId: string,
) {
  const [entry] = await db
    .insert(budgetEntries)
    .values({
      categoryId,
      type: data.type,
      supplier: data.supplier ?? null,
      description: data.description ?? null,
      amount: data.amount,
      vatAmount: data.vatAmount ?? 0,
      date: data.date,
      status: data.status ?? 'pending',
      receiptPath: data.receiptPath ?? null,
      linkedQuoteId: data.linkedQuoteId ?? null,
      notes: data.notes ?? null,
    })
    .returning();

  // Auto-create VAT entry if this is an invoice with VAT > 0
  if (data.type === 'invoice' && (data.vatAmount ?? 0) > 0) {
    await db.insert(vatEntries).values({
      projectId,
      budgetEntryId: entry.id,
      supplierName: data.supplier ?? 'Unknown supplier',
      description: data.description ?? 'Invoice',
      netAmount: data.amount,
      vatAmount: data.vatAmount!,
      invoiceTotal: data.amount + data.vatAmount!,
      invoiceDate: data.date,
      source: 'direct_purchase',
      reclaimable: 'needs_review',
    });
  }

  await logActivity(
    db,
    projectId,
    userId,
    'budget',
    'created',
    'budget_entry',
    entry.id,
    `Created ${data.type}: ${data.description ?? data.supplier ?? 'entry'} (${data.amount})`,
  );

  return entry;
}

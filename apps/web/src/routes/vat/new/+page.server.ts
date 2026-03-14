import { createApiClient } from '$lib/api-client';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return {};

  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const supplierName = formData.get('supplierName') as string;
    const invoiceNumber = formData.get('invoiceNumber') as string | null;
    const description = formData.get('description') as string;
    const netAmount = formData.get('netAmount') as string;
    const vatAmount = formData.get('vatAmount') as string;
    const invoiceDate = formData.get('invoiceDate') as string;
    const source = formData.get('source') as string;
    const notes = formData.get('notes') as string | null;

    if (!supplierName || !description || !netAmount || !vatAmount || !invoiceDate || !source) {
      return fail(400, { error: 'Please fill in all required fields' });
    }

    const netPence = Math.round(parseFloat(netAmount) * 100);
    const vatPence = Math.round(parseFloat(vatAmount) * 100);

    if (isNaN(netPence) || isNaN(vatPence)) {
      return fail(400, { error: 'Amounts must be valid numbers' });
    }

    try {
      const api = createApiClient(session.access_token);
      const result = await api.post('/api/v1/projects/PROJECT_ID/vat/entries', {
        supplierName,
        invoiceNumber: invoiceNumber || null,
        description,
        netAmount: netPence,
        vatAmount: vatPence,
        invoiceTotal: netPence + vatPence,
        invoiceDate,
        source,
        notes: notes || null,
      });
      return { success: true, result };
    } catch {
      return fail(500, { error: 'Failed to create VAT entry' });
    }
  },
};

import { createApiClient } from '$lib/api-client';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const categories = await api.get<any[]>('/budget/categories');
    return { categories };
  } catch {
    return { categories: [] };
  }
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const categoryId = formData.get('categoryId') as string;
    const type = formData.get('type') as string;
    const supplier = formData.get('supplier') as string | null;
    const description = formData.get('description') as string | null;
    const amount = formData.get('amount') as string;
    const vatAmount = formData.get('vatAmount') as string;
    const date = formData.get('date') as string;
    const notes = formData.get('notes') as string | null;

    if (!categoryId || !type || !amount || !date) {
      return fail(400, { error: 'Category, type, amount, and date are required' });
    }

    const amountPence = Math.round(parseFloat(amount) * 100);
    const vatPence = vatAmount ? Math.round(parseFloat(vatAmount) * 100) : 0;

    if (isNaN(amountPence)) {
      return fail(400, { error: 'Amount must be a valid number' });
    }

    try {
      const api = createApiClient();
      await api.post('/budget/entries', {
        categoryId,
        type,
        supplier: supplier || null,
        description: description || null,
        amount: amountPence,
        vatAmount: vatPence,
        date,
        status: 'pending',
        notes: notes || null,
      });
    } catch {
      return fail(500, { error: 'Failed to create entry' });
    }

    throw redirect(303, '/budget/entries');
  },
};

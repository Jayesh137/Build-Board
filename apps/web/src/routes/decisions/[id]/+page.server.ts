import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {

  try {
    const api = createApiClient();
    const [decision, options] = await Promise.all([
      api.get(`/api/v1/projects/PROJECT_ID/decisions/${params.id}`).catch(() => null),
      api.get(`/api/v1/projects/PROJECT_ID/decisions/${params.id}/options`).catch(() => []),
    ]);
  } catch {
    return { decision: null, options: [] };
  }
};

export const actions: Actions = {
  update: async ({ params, request, locals }) => {

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string | null;
    const status = formData.get('status') as string | null;
    const deadline = formData.get('deadline') as string | null;
    const leadTimeDays = formData.get('leadTimeDays') as string | null;
    const notes = formData.get('notes') as string | null;

    try {
      const api = createApiClient();
      await api.patch(`/api/v1/projects/PROJECT_ID/decisions/${params.id}`, {
        title: title || undefined,
        category: category || null,
        status: status || undefined,
        deadline: deadline || null,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays, 10) : null,
        notes: notes || null,
      });
    } catch {
      return fail(500, { error: 'Failed to update decision' });
    }
  },

  addOption: async ({ params, request, locals }) => {

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const supplier = formData.get('supplier') as string | null;
    const costPence = formData.get('costPence') as string | null;
    const pros = formData.get('pros') as string | null;
    const cons = formData.get('cons') as string | null;
    const url = formData.get('url') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!name) {
      return fail(400, { error: 'Option name is required' });
    }

    try {
      const api = createApiClient();
      await api.post(`/api/v1/projects/PROJECT_ID/decisions/${params.id}/options`, {
        name,
        supplier: supplier || null,
        costPence: costPence ? Math.round(parseFloat(costPence) * 100) : null,
        pros: pros || null,
        cons: cons || null,
        url: url || null,
        notes: notes || null,
      });
    } catch {
      return fail(500, { error: 'Failed to add option' });
    }
  },

  chooseOption: async ({ params, request, locals }) => {

    const formData = await request.formData();
    const optionId = formData.get('optionId') as string;

    if (!optionId) {
      return fail(400, { error: 'Option ID is required' });
    }

    try {
      const api = createApiClient();
      await api.patch(`/api/v1/projects/PROJECT_ID/decisions/${params.id}`, {
        chosenOptionId: optionId,
        status: 'decided',
      });
    } catch {
      return fail(500, { error: 'Failed to choose option' });
    }
  },
};

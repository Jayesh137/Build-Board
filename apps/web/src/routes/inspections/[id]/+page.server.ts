import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {

  try {
    const api = createApiClient();
    const inspection = await api.get(`/api/v1/projects/PROJECT_ID/inspections/${params.id}`);
  } catch {
    return { inspection: null };
  }
};

export const actions: Actions = {
  update: async ({ request, params }) => {

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const scheduledDate = formData.get('scheduledDate') as string | null;
    const inspector = formData.get('inspector') as string | null;
    const resultNotes = formData.get('resultNotes') as string | null;

    try {
      const api = createApiClient();
      await api.patch(`/api/v1/projects/PROJECT_ID/inspections/${params.id}`, {
        status,
        scheduledDate: scheduledDate || null,
        inspector: inspector || null,
        resultNotes: resultNotes || null,
      });
    } catch {
      return fail(500, { error: 'Failed to update inspection' });
    }
  },
};

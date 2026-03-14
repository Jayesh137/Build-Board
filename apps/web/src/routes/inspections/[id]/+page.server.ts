import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { inspection: null };

  try {
    const api = createApiClient(session.access_token);
    const inspection = await api.get(`/api/v1/projects/PROJECT_ID/inspections/${params.id}`);
    return { inspection };
  } catch {
    return { inspection: null };
  }
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const scheduledDate = formData.get('scheduledDate') as string | null;
    const inspector = formData.get('inspector') as string | null;
    const resultNotes = formData.get('resultNotes') as string | null;

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/inspections/${params.id}`, {
        status,
        scheduledDate: scheduledDate || null,
        inspector: inspector || null,
        resultNotes: resultNotes || null,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update inspection' });
    }
  },
};

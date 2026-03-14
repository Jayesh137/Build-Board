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
    const title = formData.get('title') as string;
    const room = formData.get('room') as string | null;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string | null;

    if (!title) {
      return fail(400, { error: 'Title is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      const result = await api.post<{ id: string }>('/api/v1/projects/PROJECT_ID/snags', {
        title,
        room: room || null,
        severity: severity || 'minor',
        description: description || null,
      });
      throw redirect(303, `/snags/${result.id}`);
    } catch (e) {
      if (e instanceof Response || (e && typeof e === 'object' && 'status' in e && (e as { status: number }).status === 303)) throw e;
      return fail(500, { error: 'Failed to create snag' });
    }
  },
};

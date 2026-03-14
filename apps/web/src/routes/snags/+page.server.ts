import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const result = await api.get<any>('/snags').catch(() => ({ snags: [], counts: {} }));
    return { snags: result.snags || [], stats: result.counts || null, shareToken: null };
  } catch {
    return { snags: [], stats: null, shareToken: null };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const room = formData.get('room') as string | null;
    const severity = formData.get('severity') as string;

    if (!title) return fail(400, { error: 'Title is required' });

    try {
      const api = createApiClient();
      await api.post('/snags', {
        title,
        room: room || null,
        severity: severity || 'minor',
        dateFound: new Date().toISOString().split('T')[0],
      });
    } catch {
      return fail(500, { error: 'Failed to create snag' });
    }
  },
};

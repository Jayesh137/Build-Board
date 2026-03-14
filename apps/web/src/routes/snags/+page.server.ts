import { getSnags } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const snagList = await getSnags();
    const snags = snagList ?? [];
    const stats = {
      open: snags.filter((s: any) => s.status === 'open').length,
      assigned: snags.filter((s: any) => s.status === 'assigned').length,
      in_progress: snags.filter((s: any) => s.status === 'in_progress').length,
      resolved: snags.filter((s: any) => s.status === 'resolved').length,
      verified: snags.filter((s: any) => s.status === 'verified').length,
      total: snags.length,
    };
    return { snags, stats, shareToken: null };
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

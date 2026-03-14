import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { snags: [], stats: null, shareToken: null };

  try {
    const api = createApiClient(session.access_token);
    const [snags, stats, shareInfo] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/snags').catch(() => []),
      api.get('/api/v1/projects/PROJECT_ID/snags/stats').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/snags/share').catch(() => null),
    ]);
    return {
      snags,
      stats,
      shareToken: (shareInfo as { token?: string } | null)?.token ?? null,
    };
  } catch {
    return { snags: [], stats: null, shareToken: null };
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const room = formData.get('room') as string | null;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string | null;
    const contractor = formData.get('contractor') as string | null;

    if (!title) {
      return fail(400, { error: 'Title is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.post('/api/v1/projects/PROJECT_ID/snags', {
        title,
        room: room || null,
        severity: severity || 'minor',
        description: description || null,
        contractor: contractor || null,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to create snag' });
    }
  },
};

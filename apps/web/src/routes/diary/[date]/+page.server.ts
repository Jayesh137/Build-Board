import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { entry: null, photos: [] };

  try {
    const api = createApiClient(session.access_token);
    const [entry, photos] = await Promise.all([
      api.get(`/api/v1/projects/PROJECT_ID/diary/${params.date}`).catch(() => null),
      api.get(`/api/v1/projects/PROJECT_ID/diary/${params.date}/photos`).catch(() => []),
    ]);
    return { entry, photos, date: params.date };
  } catch {
    return { entry: null, photos: [], date: params.date };
  }
};

export const actions: Actions = {
  update: async ({ params, request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const weather = formData.get('weather') as string | null;
    const progress = formData.get('progress') as string | null;
    const notes = formData.get('notes') as string | null;
    const hasConcealedWorks = formData.get('hasConcealedWorks') === 'true';

    const workers: string[] = [];
    const workerTypes = ['Builder', 'Electrician', 'Plumber', 'Roofer', 'Plasterer', 'Painter', 'Landscaper', 'Other'];
    for (const worker of workerTypes) {
      if (formData.get(`worker_${worker}`) === 'on') {
        workers.push(worker);
      }
    }

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/diary/${params.date}`, {
        weather: weather || null,
        workersOnSite: workers,
        progress: progress || null,
        notes: notes || null,
        hasConcealedWorks,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update diary entry' });
    }
  },
};

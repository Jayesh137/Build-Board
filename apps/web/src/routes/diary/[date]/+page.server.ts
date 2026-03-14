import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const api = createApiClient();
    const [entry, photos] = await Promise.all([
      api.get(`/diary/${params.date}`).catch(() => null),
      api.get(`/diary/${params.date}/photos`).catch(() => []),
    ]);
    return { entry, photos, date: params.date };
  } catch {
    return { entry: null, photos: [], date: params.date };
  }
};

export const actions: Actions = {
  update: async ({ params, request }) => {
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
      const api = createApiClient();
      await api.patch(`/diary/${params.date}`, {
        weather: weather || null,
        workersOnSite: workers,
        progress: progress || null,
        notes: notes || null,
        hasConcealedWorks,
      });
    } catch {
      return fail(500, { error: 'Failed to update diary entry' });
    }
  },
};

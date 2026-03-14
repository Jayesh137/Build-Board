import { createApiClient } from '$lib/api-client';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const date = formData.get('date') as string;
    const weather = formData.get('weather') as string | null;
    const progress = formData.get('progress') as string | null;
    const notes = formData.get('notes') as string | null;
    const hasConcealedWorks = formData.get('hasConcealedWorks') === 'true';

    // Collect workers on site
    const workers: string[] = [];
    const workerTypes = ['Builder', 'Electrician', 'Plumber', 'Roofer', 'Plasterer', 'Painter', 'Landscaper', 'Other'];
    for (const worker of workerTypes) {
      if (formData.get(`worker_${worker}`) === 'on') {
        workers.push(worker);
      }
    }

    if (!date) {
      return fail(400, { error: 'Date is required' });
    }

    try {
      const api = createApiClient();
      await api.post('/diary', {
        date,
        weather: weather || null,
        workersOnSite: workers,
        progress: progress || null,
        notes: notes || null,
        hasConcealedWorks,
      });
    } catch {
      return fail(500, { error: 'Failed to create diary entry' });
    }

    throw redirect(303, `/diary/${date}`);
  },
};

import { getDecisions } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const decisions = await getDecisions();
    return { decisions: decisions ?? [] };
  } catch {
    return { decisions: [] };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const deadline = formData.get('deadline') as string | null;
    const leadTimeDays = formData.get('leadTimeDays') as string | null;
    const notes = formData.get('notes') as string | null;
    const linkedTaskId = formData.get('linkedTaskId') as string | null;

    if (!title) {
      return fail(400, { error: 'Title is required' });
    }

    try {
      const api = createApiClient();
      await api.post('/decisions', {
        title,
        category: category || null,
        deadline: deadline || null,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays, 10) : null,
        notes: notes || null,
        linkedTaskId: linkedTaskId || null,
      });
    } catch {
      return fail(500, { error: 'Failed to create decision' });
    }
  },
};

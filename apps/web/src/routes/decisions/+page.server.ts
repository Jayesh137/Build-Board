import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { decisions: [] };

  try {
    const api = createApiClient(session.access_token);
    const decisions = await api.get('/api/v1/projects/PROJECT_ID/decisions').catch(() => []);
    return { decisions };
  } catch {
    return { decisions: [] };
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

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
      const api = createApiClient(session.access_token);
      await api.post('/api/v1/projects/PROJECT_ID/decisions', {
        title,
        category: category || null,
        deadline: deadline || null,
        leadTimeDays: leadTimeDays ? parseInt(leadTimeDays, 10) : null,
        notes: notes || null,
        linkedTaskId: linkedTaskId || null,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to create decision' });
    }
  },
};

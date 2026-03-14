import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { getProject } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const project = await getProject();
    return { project, userEmail: null };
  } catch {
    return { project: null, userEmail: null };
  }
};

export const actions: Actions = {
  update: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const totalBudget = formData.get('totalBudget') as string;
    const targetCompletion = formData.get('targetCompletion') as string;

    if (!name?.trim()) return fail(400, { error: 'Project name is required' });
    if (!address?.trim()) return fail(400, { error: 'Site address is required' });

    try {
      const api = createApiClient();
      await api.patch('', {
        name: name.trim(),
        address: address.trim(),
        totalBudget: totalBudget ? parseInt(totalBudget.replace(/[^0-9]/g, ''), 10) : null,
        targetCompletion: targetCompletion || null,
      });
      return { success: true };
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { error: 'Failed to update project settings' });
    }
  },
};

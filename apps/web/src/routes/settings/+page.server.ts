import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { getProject } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    const project = await getProject();
    const session = locals.session;
    return { project, userEmail: session?.user?.email ?? null };
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
    const startDate = formData.get('startDate') as string;
    const targetCompletion = formData.get('targetCompletion') as string;

    if (!name?.trim()) return fail(400, { error: 'Project name is required' });
    if (!address?.trim()) return fail(400, { error: 'Site address is required' });

    try {
      const api = createApiClient();
      const budgetPounds = totalBudget ? parseInt(totalBudget.replace(/[^0-9]/g, ''), 10) : null;
      await api.patch('', {
        name: name.trim(),
        address: address.trim(),
        // Store pence: user enters pounds, multiply by 100
        totalBudget: budgetPounds != null && !isNaN(budgetPounds) ? budgetPounds * 100 : null,
        startDate: startDate || null,
        targetCompletion: targetCompletion || null,
      });
      return { success: true };
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { error: 'Failed to update project settings' });
    }
  },

  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    throw redirect(303, '/auth/login');
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const confirmation = formData.get('confirmation') as string;

    if (confirmation !== 'DELETE') {
      return fail(400, { deleteError: 'Type DELETE to confirm' });
    }

    try {
      const api = createApiClient();
      await api.del('');
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { deleteError: 'Failed to delete project' });
    }

    throw redirect(303, '/setup');
  },
};

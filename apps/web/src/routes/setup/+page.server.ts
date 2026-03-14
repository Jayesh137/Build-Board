import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { createApiClient } from '$lib/api-client';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) throw redirect(303, '/auth/login');

  // Check if user already has a project
  try {
    const api = createApiClient(session.access_token);
    const projects = await api.get<Array<{ id: string }>>('/api/v1/setup');
    if (projects && projects.length > 0) {
      throw redirect(303, '/');
    }
  } catch (e) {
    if (isRedirect(e)) throw e;
    // Otherwise, user has no projects — continue to setup
  }

  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) throw redirect(303, '/auth/login');

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const totalBudget = formData.get('totalBudget') as string;
    const targetCompletion = formData.get('targetCompletion') as string;

    if (!name || !name.trim()) {
      return fail(400, { error: 'Project name is required', name, address, totalBudget, targetCompletion });
    }

    if (!address || !address.trim()) {
      return fail(400, { error: 'Address is required', name, address, totalBudget, targetCompletion });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.post('/api/v1/setup', {
        name: name.trim(),
        address: address.trim(),
        totalBudget: totalBudget ? parseInt(totalBudget.replace(/[^0-9]/g, ''), 10) : null,
        targetCompletion: targetCompletion || null,
      });

      throw redirect(303, '/');
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { error: 'Failed to create project. Please try again.', name, address, totalBudget, targetCompletion });
    }
  },
};

import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { createApiClient } from '$lib/api-client';
import type { PageServerLoad, Actions } from './$types';

interface Project {
  id: string;
  name: string;
  address: string;
  localAuthority: string;
  totalBudget: number | null;
  contingencyPct: number | null;
  startDate: string | null;
  targetCompletion: string | null;
  createdAt: string;
}

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();
  if (!session) throw redirect(303, '/auth/login');

  try {
    const api = createApiClient(session.access_token);
    const projects = await api.get<Project[]>('/api/v1/setup');
    const project = projects && projects.length > 0 ? projects[0] : null;
    return { project, userEmail: user?.email ?? null };
  } catch (e) {
    if (isRedirect(e)) throw e;
    return { project: null, userEmail: user?.email ?? null };
  }
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) throw redirect(303, '/auth/login');

    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const totalBudget = formData.get('totalBudget') as string;
    const targetCompletion = formData.get('targetCompletion') as string;

    if (!projectId) {
      return fail(400, { error: 'No project found' });
    }

    if (!name || !name.trim()) {
      return fail(400, { error: 'Project name is required' });
    }

    if (!address || !address.trim()) {
      return fail(400, { error: 'Site address is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/${projectId}`, {
        name: name.trim(),
        address: address.trim(),
        totalBudget: totalBudget ? parseInt(totalBudget.replace(/[^0-9]/g, ''), 10) : null,
        targetCompletion: targetCompletion || null,
      });

      return { success: true };
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { error: 'Failed to update project settings. Please try again.' });
    }
  },

  delete: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) throw redirect(303, '/auth/login');

    const formData = await request.formData();
    const projectId = formData.get('projectId') as string;
    const confirmation = formData.get('confirmation') as string;

    if (!projectId) {
      return fail(400, { deleteError: 'No project found' });
    }

    if (confirmation !== 'DELETE') {
      return fail(400, { deleteError: 'Please type DELETE to confirm' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.del(`/api/v1/projects/${projectId}`);
      throw redirect(303, '/setup');
    } catch (e) {
      if (isRedirect(e)) throw e;
      return fail(500, { deleteError: 'Failed to delete project. Please try again.' });
    }
  },
};

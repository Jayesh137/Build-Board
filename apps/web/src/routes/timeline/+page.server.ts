import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { phases: [] };

  try {
    const api = createApiClient(session.access_token);
    const phases = await api.get('/api/v1/projects/PROJECT_ID/phases?include=tasks');
    return { phases };
  } catch {
    return { phases: [] };
  }
};

export const actions: Actions = {
  createTask: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const phaseId = formData.get('phaseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const status = formData.get('status') as string;
    const dueDate = formData.get('dueDate') as string | null;
    const assigneeId = formData.get('assigneeId') as string | null;
    const isMilestone = formData.get('isMilestone') === 'true';

    if (!title || !phaseId) {
      return fail(400, { error: 'Title and phase are required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.post('/api/v1/projects/PROJECT_ID/tasks', {
        phaseId,
        title,
        description: description || null,
        status: status || 'not_started',
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        isMilestone,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to create task' });
    }
  },

  updateTaskStatus: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const status = formData.get('status') as string;

    if (!taskId || !status) {
      return fail(400, { error: 'Task ID and status are required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/tasks/${taskId}`, { status });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update task' });
    }
  },
};

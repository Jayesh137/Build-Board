import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { task: null, dependencies: [], inspection: null };

  try {
    const api = createApiClient(session.access_token);
    const [task, dependencies, inspection] = await Promise.all([
      api.get(`/api/v1/projects/PROJECT_ID/tasks/${params.taskId}`),
      api.get(`/api/v1/projects/PROJECT_ID/tasks/${params.taskId}/dependencies`).catch(() => []),
      api.get(`/api/v1/projects/PROJECT_ID/tasks/${params.taskId}/inspection`).catch(() => null),
    ]);
    return { task, dependencies, inspection };
  } catch {
    return { task: null, dependencies: [], inspection: null };
  }
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const status = formData.get('status') as string;
    const dueDate = formData.get('dueDate') as string | null;
    const startDate = formData.get('startDate') as string | null;
    const assigneeId = formData.get('assigneeId') as string | null;
    const isMilestone = formData.get('isMilestone') === 'true';
    const notes = formData.get('notes') as string | null;

    if (!title) {
      return fail(400, { error: 'Title is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/tasks/${params.taskId}`, {
        title,
        description: description || null,
        status,
        dueDate: dueDate || null,
        startDate: startDate || null,
        assigneeId: assigneeId || null,
        isMilestone,
        notes: notes || null,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update task' });
    }
  },
};

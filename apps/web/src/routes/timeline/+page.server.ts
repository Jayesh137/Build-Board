import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /phases returns a JSON array directly: [{ id, name, sortOrder, status, tasks: [...] }, ...]
    const phasesData = await api.get<any>('/phases?include=tasks');
    const phases = Array.isArray(phasesData) ? phasesData : [];
    return { phases };
  } catch {
    return { phases: [] };
  }
};

export const actions: Actions = {
  createTask: async ({ request }) => {
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
      const api = createApiClient();
      await api.post('/tasks', {
        phaseId,
        title,
        description: description || null,
        status: status || 'not_started',
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        isMilestone,
      });
    } catch {
      return fail(500, { error: 'Failed to create task' });
    }
  },

  updateTaskStatus: async ({ request }) => {
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    const status = formData.get('status') as string;

    if (!taskId || !status) {
      return fail(400, { error: 'Task ID and status are required' });
    }

    try {
      const api = createApiClient();
      await api.patch(`/tasks/${taskId}`, { status });
    } catch {
      return fail(500, { error: 'Failed to update task' });
    }
  },
};

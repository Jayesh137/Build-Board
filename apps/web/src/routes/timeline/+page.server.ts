import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import { getPhaseGuidance } from '@buildtracker/shared';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /phases returns a JSON array directly: [{ id, name, sortOrder, status, tasks: [...] }, ...]
    const phasesData = await api.get<any>('/phases?include=tasks');
    const phases = Array.isArray(phasesData) ? phasesData : [];

    // Determine current phase: first in_progress, or first not_started, or first overall
    let currentPhase: any = null;
    for (const phase of phases) {
      if (phase.status === 'in_progress') {
        currentPhase = phase;
        break;
      }
    }
    if (!currentPhase) {
      for (const phase of phases) {
        if (phase.status !== 'done') {
          currentPhase = phase;
          break;
        }
      }
    }
    if (!currentPhase && phases.length > 0) {
      currentPhase = phases[0];
    }

    const currentPhaseName = currentPhase?.name ?? 'Pre-Construction';
    const phaseGuidance = getPhaseGuidance(currentPhaseName);

    return {
      phases,
      currentPhaseName,
      phaseGuidance: phaseGuidance ? {
        phaseName: currentPhaseName,
        summary: phaseGuidance.summary,
        whatToFocus: phaseGuidance.whatToFocus,
        tips: phaseGuidance.tips,
        commonMistakes: phaseGuidance.commonMistakes,
        keyDecisions: phaseGuidance.keyDecisions,
      } : null,
    };
  } catch {
    return { phases: [], currentPhaseName: null, phaseGuidance: null };
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

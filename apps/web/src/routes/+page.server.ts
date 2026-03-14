import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { project: null, alerts: [], budget: null, recentTasks: [], milestones: [], snagCount: 0, decisionCount: 0, conditionCount: 0, vatTotal: 0 };

  try {
    const api = createApiClient(session.access_token);
    // In production, projectId comes from user's first project
    // For now return empty data - will be wired up after setup flow
    return {
      project: null,
      alerts: [],
      budget: null,
      recentTasks: [],
      milestones: [],
      snagCount: 0,
      decisionCount: 0,
      conditionCount: 0,
      vatTotal: 0,
    };
  } catch {
    return { project: null, alerts: [], budget: null, recentTasks: [], milestones: [], snagCount: 0, decisionCount: 0, conditionCount: 0, vatTotal: 0 };
  }
};

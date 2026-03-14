import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const empty = {
    project: null,
    alerts: [] as any[],
    budget: null,
    recentTasks: [] as any[],
    milestones: [] as any[],
    snagCount: 0,
    decisionCount: 0,
    conditionCount: 0,
    vatTotal: 0,
  };

  try {
    const api = createApiClient();
    const project = await api.get<any>('');
    return { ...empty, project };
  } catch {
    return empty;
  }
};

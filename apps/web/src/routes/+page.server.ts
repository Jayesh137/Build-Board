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
    const [project, phasesData] = await Promise.all([
      api.get<any>('').catch(() => null),
      api.get<any>('/phases').catch(() => ({ phases: [] })),
    ]);

    // Calculate progress from actual task data
    const phases = phasesData?.phases || phasesData || [];
    let totalTasks = 0;
    let doneTasks = 0;
    let currentPhase = 'Phase A: Pre-Construction';

    if (Array.isArray(phases)) {
      for (const phase of phases) {
        const tasks = phase.tasks || [];
        totalTasks += tasks.length;
        doneTasks += tasks.filter((t: any) => t.status === 'done').length;
        if (phase.status === 'in_progress') {
          currentPhase = `Phase ${phase.name}`;
        }
      }
    }

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      ...empty,
      project: project ? { ...project, progress, currentPhase } : null,
    };
  } catch {
    return empty;
  }
};

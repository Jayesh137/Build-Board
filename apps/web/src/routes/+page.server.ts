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

    const [project, phasesData, budgetData, decisionsData, snagData, planningData, vatData, alertsData] = await Promise.all([
      api.get<any>('').catch(() => null),
      api.get<any>('/phases').catch(() => []),
      api.get<any>('/budget').catch(() => null),
      api.get<any>('/decisions').catch(() => []),
      api.get<any>('/snags').catch(() => ({ snags: [] })),
      api.get<any>('/planning').catch(() => ({ conditions: [] })),
      api.get<any>('/vat').catch(() => null),
      api.get<any>('/alerts').catch(() => ({ alerts: [] })),
    ]);

    // Calculate progress from actual task data
    const phases = Array.isArray(phasesData) ? phasesData : (phasesData?.phases || []);
    let totalTasks = 0;
    let doneTasks = 0;
    let currentPhase = 'Phase A: Pre-Construction';
    const milestones: any[] = [];
    const recentTasks: any[] = [];

    for (const phase of phases) {
      const tasks = phase.tasks || [];
      totalTasks += tasks.length;
      for (const t of tasks) {
        if (t.status === 'done') doneTasks++;
        if (t.isMilestone && t.status !== 'done') milestones.push(t);
        if (t.status === 'in_progress' || (t.dueDate && t.status !== 'done')) recentTasks.push(t);
      }
      if (phase.status === 'in_progress') currentPhase = `Phase ${phase.name}`;
    }

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Budget summary
    const budget = budgetData ? {
      total: project?.totalBudget || 0,
      spent: budgetData.totalSpent || 0,
      committed: budgetData.totalCommitted || 0,
      remaining: (project?.totalBudget || 0) - (budgetData.totalSpent || 0) - (budgetData.totalCommitted || 0),
      contingencyRemaining: budgetData.contingencyRemaining ?? (project?.contingencyPct || 15),
      contingencyPct: budgetData.contingencyPct ?? (project?.contingencyPct || 15),
    } : null;

    // Counts
    const allDecisions = Array.isArray(decisionsData) ? decisionsData : (decisionsData?.decisions || []);
    const decisionCount = allDecisions.filter((d: any) => d.status !== 'decided' && d.status !== 'ordered').length;

    const snags = snagData?.snags || [];
    const snagCount = snags.filter((s: any) => s.status === 'open' || s.status === 'assigned' || s.status === 'in_progress').length;

    const conditions = planningData?.conditions || [];
    const conditionCount = conditions.filter((c: any) => c.status !== 'discharged' && c.conditionType === 'pre_commencement').length;

    const vatTotal = vatData?.totalReclaimable || 0;
    const alerts = alertsData?.alerts || [];

    return {
      project: project ? { ...project, progress, currentPhase } : null,
      alerts,
      budget,
      recentTasks: recentTasks.slice(0, 5),
      milestones: milestones.slice(0, 3),
      snagCount,
      decisionCount,
      conditionCount,
      vatTotal,
    };
  } catch {
    return empty;
  }
};

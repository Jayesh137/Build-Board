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
      api.get<any>('/decisions').catch(() => ({ decisions: [] })),
      api.get<any>('/snags').catch(() => ({ snags: [] })),
      api.get<any>('/planning').catch(() => ({ conditions: [] })),
      api.get<any>('/vat').catch(() => null),
      api.get<any>('/alerts').catch(() => ({ alerts: [] })),
    ]);

    // GET /phases returns array directly
    const phases = Array.isArray(phasesData) ? phasesData : [];
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

    // GET /budget returns { categories: [...] }
    // Each category has: spent, committed, allocatedAmount
    const budgetCategories = budgetData?.categories ?? [];
    const totalSpent = budgetCategories.reduce((sum: number, c: any) => sum + (c.spent ?? 0), 0);
    const totalCommitted = budgetCategories.reduce((sum: number, c: any) => sum + (c.committed ?? 0), 0);
    const totalBudget = project?.totalBudget ?? 0;

    const budget = budgetData ? {
      total: totalBudget,
      spent: totalSpent,
      committed: totalCommitted,
      remaining: totalBudget - totalSpent - totalCommitted,
      contingencyRemaining: project?.contingencyPct ?? 15,
      contingencyPct: project?.contingencyPct ?? 15,
    } : null;

    // GET /decisions returns { decisions: [...] }
    const allDecisions = decisionsData?.decisions ?? [];
    const decisionCount = allDecisions.filter((d: any) => d.status !== 'decided' && d.status !== 'ordered').length;

    // GET /snags returns { snags: [], counts: {} }
    const snags = snagData?.snags ?? [];
    const snagCount = snags.filter((s: any) => s.status === 'open' || s.status === 'assigned' || s.status === 'in_progress').length;

    // GET /planning returns { conditions: [...], cilSteps: [...] }
    const conditions = planningData?.conditions ?? [];
    const conditionCount = conditions.filter((c: any) => c.status !== 'discharged' && c.conditionType === 'pre_commencement').length;

    // GET /vat returns { totalVAT, totalReclaimable, ... }
    const vatTotal = vatData?.totalReclaimable ?? 0;

    // GET /alerts returns { alerts: [...], counts: { critical, warning, info, total } }
    const alerts = alertsData?.alerts ?? [];

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

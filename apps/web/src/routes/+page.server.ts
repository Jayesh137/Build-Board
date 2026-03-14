import { createApiClient } from '$lib/api-client';
import { computeNextActions, getPhaseGuidance } from '@buildtracker/shared';
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
    nextActions: [] as any[],
    phaseGuidance: null as any,
    currentPhase: null as any,
    progress: 0,
  };

  try {
    const api = createApiClient();

    const [
      project,
      phasesData,
      budgetData,
      decisionsData,
      snagData,
      planningData,
      vatData,
      alertsData,
      inspectionsData,
    ] = await Promise.all([
      api.get<any>('').catch(() => null),
      api.get<any>('/phases').catch(() => []),
      api.get<any>('/budget').catch(() => null),
      api.get<any>('/decisions').catch(() => ({ decisions: [] })),
      api.get<any>('/snags').catch(() => ({ snags: [] })),
      api.get<any>('/planning').catch(() => ({ conditions: [], cilSteps: [] })),
      api.get<any>('/vat').catch(() => null),
      api.get<any>('/alerts').catch(() => ({ alerts: [] })),
      api.get<any>('/inspections').catch(() => ({ inspections: [] })),
    ]);

    // GET /phases returns array directly
    const phases = Array.isArray(phasesData) ? phasesData : [];
    let totalTasks = 0;
    let doneTasks = 0;
    const allTasks: any[] = [];
    const milestones: any[] = [];
    const recentTasks: any[] = [];

    // Determine current phase: first in_progress, or first not_started
    let currentPhaseObj: any = null;
    for (const phase of phases) {
      if (phase.status === 'in_progress') {
        currentPhaseObj = phase;
        break;
      }
    }
    if (!currentPhaseObj) {
      for (const phase of phases) {
        if (phase.status === 'not_started') {
          currentPhaseObj = phase;
          break;
        }
      }
    }

    const currentPhaseName = currentPhaseObj
      ? currentPhaseObj.name
      : 'Pre-Construction';

    for (const phase of phases) {
      const tasks = phase.tasks || [];
      totalTasks += tasks.length;
      for (const t of tasks) {
        allTasks.push(t);
        if (t.status === 'done') doneTasks++;
        if (t.isMilestone && t.status !== 'done') milestones.push(t);
        if (t.status === 'in_progress' || (t.dueDate && t.status !== 'done')) recentTasks.push(t);
      }
    }

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // GET /budget returns { categories: [...] }
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
    const cilSteps = planningData?.cilSteps ?? [];
    const conditionCount = conditions.filter((c: any) => c.status !== 'discharged' && c.conditionType === 'pre_commencement').length;

    // GET /vat returns { totalVAT, totalReclaimable, ... }
    const vatTotal = vatData?.totalReclaimable ?? 0;

    // GET /alerts returns { alerts: [...], counts: { critical, warning, info, total } }
    const alerts = alertsData?.alerts ?? [];

    // GET /inspections returns { inspections: [...] }
    const inspections = inspectionsData?.inspections ?? [];

    // Compute next actions from all data sources
    const nextActions = computeNextActions({
      cilSteps,
      planningConditions: conditions,
      tasks: allTasks,
      decisions: allDecisions,
      inspections,
    });

    // Get phase guidance for the current phase
    const phaseGuidance = getPhaseGuidance(currentPhaseName);

    return {
      project: project ? { ...project, progress, currentPhase: currentPhaseName } : null,
      alerts,
      budget,
      recentTasks: recentTasks.slice(0, 5),
      milestones: milestones.slice(0, 3),
      snagCount,
      decisionCount,
      conditionCount,
      vatTotal,
      nextActions,
      phaseGuidance,
      currentPhase: currentPhaseName,
      progress,
    };
  } catch {
    return empty;
  }
};

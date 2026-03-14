import { getPlanningData, getProject } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [planningData, project] = await Promise.all([
      getPlanningData(),
      getProject(),
    ]);

    const conditions = planningData?.conditions ?? [];
    const cilSteps = planningData?.cilSteps ?? [];

    // Build planningStatus from project data if available
    const planningStatus = project ? {
      reference: (project as any).planningReference ?? (project as any).planningRef ?? '',
      status: (project as any).planningStatus ?? 'approved',
      expiryDate: (project as any).planningExpiry ?? null,
      localAuthority: project.localAuthority ?? '',
    } : null;

    return { planningStatus, conditions, cilSteps };
  } catch {
    return { planningStatus: null, conditions: [], cilSteps: [] };
  }
};

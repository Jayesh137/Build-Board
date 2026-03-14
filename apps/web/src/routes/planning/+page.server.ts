import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /planning returns { conditions: [...], cilSteps: [...] }
    // Also fetch project data for planning status info
    const [planningData, project] = await Promise.all([
      api.get<any>('/planning').catch(() => ({ conditions: [], cilSteps: [] })),
      api.get<any>('').catch(() => null),
    ]);

    const conditions = planningData?.conditions ?? [];
    const cilSteps = planningData?.cilSteps ?? [];

    // Build planningStatus from project data if available
    const planningStatus = project ? {
      reference: project.planningReference ?? project.planningRef ?? '',
      status: project.planningStatus ?? 'approved',
      expiryDate: project.planningExpiry ?? null,
      localAuthority: project.localAuthority ?? '',
    } : null;

    return { planningStatus, conditions, cilSteps };
  } catch {
    return { planningStatus: null, conditions: [], cilSteps: [] };
  }
};

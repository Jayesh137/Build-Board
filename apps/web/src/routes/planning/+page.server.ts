import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

  try {
    const api = createApiClient();
    const [planningStatus, conditions, cilSteps] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/planning/status').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/planning/conditions').catch(() => []),
      api.get('/api/v1/projects/PROJECT_ID/cil/steps').catch(() => []),
    ]);
  } catch {
    return { planningStatus: null, conditions: [], cilSteps: [] };
  }
};

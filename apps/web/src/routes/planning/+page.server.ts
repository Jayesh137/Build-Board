import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const [planningStatus, conditions, cilSteps] = await Promise.all([
      api.get('/planning/status').catch(() => null),
      api.get('/planning/conditions').catch(() => []),
      api.get('/cil/steps').catch(() => []),
    ]);
    return { planningStatus, conditions, cilSteps };
  } catch {
    return { planningStatus: null, conditions: [], cilSteps: [] };
  }
};

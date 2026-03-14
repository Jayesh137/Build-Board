import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /inspections returns a JSON array directly: [{ id, name, type, ... }]
    const inspections = await api.get<any[]>('/inspections');
    return { inspections: Array.isArray(inspections) ? inspections : [] };
  } catch {
    return { inspections: [] };
  }
};

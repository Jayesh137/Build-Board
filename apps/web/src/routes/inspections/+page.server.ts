import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const inspections = await api.get<any[]>('/inspections');
    return { inspections };
  } catch {
    return { inspections: [] };
  }
};

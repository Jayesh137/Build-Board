import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { inspections: [] };

  try {
    const api = createApiClient(session.access_token);
    const inspections = await api.get('/api/v1/projects/PROJECT_ID/inspections');
    return { inspections };
  } catch {
    return { inspections: [] };
  }
};

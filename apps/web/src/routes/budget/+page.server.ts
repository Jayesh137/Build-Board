import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

  try {
    const api = createApiClient();
    const [summary, categories] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/budget/summary').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/budget/categories').catch(() => []),
    ]);
  } catch {
    return { summary: null, categories: [] };
  }
};

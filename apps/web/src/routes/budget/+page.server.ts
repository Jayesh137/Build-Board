import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { summary: null, categories: [] };

  try {
    const api = createApiClient(session.access_token);
    const [summary, categories] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/budget/summary').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/budget/categories').catch(() => []),
    ]);
    return { summary, categories };
  } catch {
    return { summary: null, categories: [] };
  }
};

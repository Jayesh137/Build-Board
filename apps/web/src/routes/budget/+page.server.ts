import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const [summary, categories] = await Promise.all([
      api.get('/budget/summary').catch(() => null),
      api.get('/budget/categories').catch(() => []),
    ]);
    return { summary, categories };
  } catch {
    return { summary: null, categories: [] };
  }
};

import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

  try {
    const api = createApiClient();
    const [entries, streak] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/diary').catch(() => []),
      api.get('/api/v1/projects/PROJECT_ID/diary/streak').catch(() => null),
    ]);
  } catch {
    return { entries: [], streak: null };
  }
};

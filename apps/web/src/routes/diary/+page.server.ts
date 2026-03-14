import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const [entries, streak] = await Promise.all([
      api.get('/diary').catch(() => []),
      api.get('/diary/streak').catch(() => null),
    ]);
    return { entries, streak };
  } catch {
    return { entries: [], streak: null };
  }
};

import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /diary returns { entries: [...] }
    const [diaryData, streak] = await Promise.all([
      api.get<any>('/diary').catch(() => ({ entries: [] })),
      api.get<any>('/diary/streak').catch(() => null),
    ]);
    const entries = diaryData?.entries ?? [];
    return { entries, streak };
  } catch {
    return { entries: [], streak: null };
  }
};

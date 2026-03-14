import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { entries: [], streak: null };

  try {
    const api = createApiClient(session.access_token);
    const [entries, streak] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/diary').catch(() => []),
      api.get('/api/v1/projects/PROJECT_ID/diary/streak').catch(() => null),
    ]);
    return { entries, streak };
  } catch {
    return { entries: [], streak: null };
  }
};

import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { summary: null, entries: [] };

  try {
    const api = createApiClient(session.access_token);
    const [summary, entries] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/vat/summary').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/vat/entries').catch(() => []),
    ]);
    return { summary, entries };
  } catch {
    return { summary: null, entries: [] };
  }
};

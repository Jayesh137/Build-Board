import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

  try {
    const api = createApiClient();
    const [summary, entries] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/vat/summary').catch(() => null),
      api.get('/api/v1/projects/PROJECT_ID/vat/entries').catch(() => []),
    ]);
  } catch {
    return { summary: null, entries: [] };
  }
};

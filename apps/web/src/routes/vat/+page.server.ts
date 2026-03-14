import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    const [summary, entries] = await Promise.all([
      api.get('/vat/summary').catch(() => null),
      api.get('/vat/entries').catch(() => []),
    ]);
    return { summary, entries };
  } catch {
    return { summary: null, entries: [] };
  }
};

import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { entries: [], categories: [] };

  const type = url.searchParams.get('type') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const status = url.searchParams.get('status') ?? '';

  try {
    const api = createApiClient(session.access_token);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (status) params.set('status', status);

    const [entries, categories] = await Promise.all([
      api.get(`/api/v1/projects/PROJECT_ID/budget/entries?${params.toString()}`),
      api.get('/api/v1/projects/PROJECT_ID/budget/categories').catch(() => []),
    ]);
    return { entries, categories };
  } catch {
    return { entries: [], categories: [] };
  }
};

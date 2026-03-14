import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const type = url.searchParams.get('type') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const status = url.searchParams.get('status') ?? '';

  try {
    const api = createApiClient();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (status) params.set('status', status);

    const [entriesData, budgetData] = await Promise.all([
      api.get<any>(`/budget/entries?${params.toString()}`),
      api.get<any>('/budget').catch(() => ({ categories: [] })),
    ]);

    // GET /budget/entries returns an array of entries
    const entries = Array.isArray(entriesData) ? entriesData : [];
    // GET /budget returns { categories: [...] }
    const categories = budgetData?.categories ?? [];

    return { entries, categories };
  } catch {
    return { entries: [], categories: [] };
  }
};

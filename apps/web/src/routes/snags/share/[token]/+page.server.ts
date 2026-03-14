import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const res = await fetch(`/api/v1/snags/share/${params.token}`);
    if (!res.ok) return { snags: [], project: null, error: 'Invalid or expired share link' };
    const data = await res.json();
    return {
      snags: data.snags ?? [],
      project: data.project ?? null,
      error: null,
    };
  } catch {
    // Fallback: try the API directly
    try {
      const API_URL = process.env.API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/v1/snags/share/${params.token}`);
      if (!res.ok) return { snags: [], project: null, error: 'Invalid or expired share link' };
      const data = await res.json();
      return {
        snags: data.snags ?? [],
        project: data.project ?? null,
        error: null,
      };
    } catch {
      return { snags: [], project: null, error: 'Could not load snag list' };
    }
  }
};

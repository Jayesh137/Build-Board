import { getInspections } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const inspections = await getInspections();
    return { inspections: Array.isArray(inspections) ? inspections : [] };
  } catch {
    return { inspections: [] };
  }
};

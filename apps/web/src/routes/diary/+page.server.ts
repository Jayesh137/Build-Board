import { getDiaryEntries } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const entries = await getDiaryEntries();
    return { entries: entries ?? [], streak: null };
  } catch {
    return { entries: [], streak: null };
  }
};

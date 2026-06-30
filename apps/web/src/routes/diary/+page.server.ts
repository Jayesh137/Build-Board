import { getDiaryEntries, getPhases } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [entries, phases] = await Promise.all([getDiaryEntries(), getPhases()]);
    const currentPhase = phases.find((phase: any) => phase.status === 'in_progress')?.name ?? null;
    const latestEntry = entries[0]?.entryDate ?? null;
    const streak = {
      currentStreak: entries.length > 0 ? 1 : 0,
      lastEntryDate: latestEntry,
    };

    return { entries: entries ?? [], streak, currentPhase };
  } catch {
    return { entries: [], streak: { currentStreak: 0, lastEntryDate: null }, currentPhase: null };
  }
};

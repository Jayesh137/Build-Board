import { getVATData } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const vatData = await getVATData();

    const summary = {
      totalReclaimable: vatData.totalReclaimable ?? 0,
      totalNotReclaimable: 0,
      totalNeedsReview: 0,
      reclaimableCount: vatData.counts?.reclaimable ?? 0,
      notReclaimableCount: vatData.counts?.nonReclaimable ?? 0,
      needsReviewCount: vatData.counts?.needsReview ?? 0,
      deadlineDate: null,
    };

    return { summary, entries: vatData.entries ?? [] };
  } catch {
    return { summary: null, entries: [] };
  }
};

import { createApiClient } from '$lib/api-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const api = createApiClient();
    // GET /vat returns { totalVAT, totalReclaimable, totalValidated, counts: { total, reclaimable, needsReview, nonReclaimable, validated }, readyToSubmit }
    // GET /budget/entries can be used for VAT entries, or there may be a /vat/entries endpoint
    const [vatData, entries] = await Promise.all([
      api.get<any>('/vat').catch(() => null),
      api.get<any>('/budget/entries?type=vat').catch(() => []),
    ]);

    // Map VAT API response to the shape the page expects
    const summary = vatData ? {
      totalReclaimable: vatData.totalReclaimable ?? 0,
      totalNotReclaimable: (vatData.totalVAT ?? 0) - (vatData.totalReclaimable ?? 0),
      totalNeedsReview: 0,
      reclaimableCount: vatData.counts?.reclaimable ?? 0,
      notReclaimableCount: vatData.counts?.nonReclaimable ?? 0,
      needsReviewCount: vatData.counts?.needsReview ?? 0,
      deadlineDate: null,
    } : null;

    // entries may be an array directly or wrapped
    const entryList = Array.isArray(entries) ? entries : (entries?.entries ?? []);

    return { summary, entries: entryList };
  } catch {
    return { summary: null, entries: [] };
  }
};

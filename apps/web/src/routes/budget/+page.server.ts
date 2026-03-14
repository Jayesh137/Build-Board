import { getBudgetCategories, getProject } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const [categoriesData, project] = await Promise.all([
      getBudgetCategories(),
      getProject(),
    ]);

    const categories = (categoriesData ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      allocatedAmount: c.allocatedAmount ?? null,
      spentAmount: c.spent ?? 0,
      committedAmount: c.committed ?? 0,
      sortOrder: c.sortOrder ?? 0,
    }));

    // Compute summary from categories and project totalBudget
    const totalBudget = project?.totalBudget ?? 0;
    const totalSpent = categories.reduce((sum: number, c: any) => sum + (c.spentAmount ?? 0), 0);
    const totalCommitted = categories.reduce((sum: number, c: any) => sum + (c.committedAmount ?? 0), 0);
    const totalRemaining = totalBudget - totalSpent - totalCommitted;
    const contingencyPct = project?.contingencyPct ?? 10;
    const contingencyAmount = Math.round(totalBudget * (contingencyPct / 100));
    // Contingency used = how much of contingency has been consumed by overspend
    const totalAllocated = categories.reduce((sum: number, c: any) => sum + (c.allocatedAmount ?? 0), 0);
    const contingencyUsed = Math.max(0, (totalSpent + totalCommitted) - (totalAllocated > 0 ? totalAllocated : totalBudget - contingencyAmount));

    const summary = {
      totalBudget,
      totalSpent,
      totalCommitted,
      totalRemaining,
      contingencyAmount,
      contingencyUsed,
    };

    return { summary, categories };
  } catch {
    return { summary: null, categories: [] };
  }
};

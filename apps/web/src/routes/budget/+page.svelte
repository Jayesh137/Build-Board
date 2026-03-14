<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Wallet from 'lucide-svelte/icons/wallet';
  import TrendingUp from 'lucide-svelte/icons/trending-up';
  import Shield from 'lucide-svelte/icons/shield';
  import Receipt from 'lucide-svelte/icons/receipt';
  import PiggyBank from 'lucide-svelte/icons/piggy-bank';

  interface BudgetSummary {
    totalBudget: number;
    totalSpent: number;
    totalCommitted: number;
    totalRemaining: number;
    contingencyAmount: number;
    contingencyUsed: number;
  }

  interface BudgetCategory {
    id: string;
    name: string;
    allocatedAmount: number | null;
    spentAmount: number;
    committedAmount: number;
    sortOrder: number;
  }

  let { data } = $props();

  const summary: BudgetSummary | null = data.summary;
  const categories: BudgetCategory[] = data.categories ?? [];

  const fmt = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  });

  function formatCurrency(pence: number): string {
    return fmt.format(pence / 100);
  }

  function budgetBarPct(spent: number, allocated: number): number {
    if (!allocated || allocated <= 0) return 0;
    return Math.min(100, Math.round((spent / allocated) * 100));
  }

  function contingencyRemainingPct(used: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.round(((total - used) / total) * 100));
  }

  function contingencyBarColor(used: number, total: number): string {
    const remainPct = contingencyRemainingPct(used, total);
    if (remainPct > 10) return 'bg-green-500';
    if (remainPct >= 5) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function contingencyTextColor(used: number, total: number): string {
    const remainPct = contingencyRemainingPct(used, total);
    if (remainPct > 10) return 'text-green-600 dark:text-green-400';
    if (remainPct >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Budget</h1>
      <p class="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">Track spending and allocations</p>
    </div>
    <a href="/budget/entries">
      <Button variant="secondary" size="sm">
        <Receipt size={16} />
        View Entries
      </Button>
    </a>
  </div>

  <!-- Summary cards -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Budget -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <div class="border-t-4 border-t-indigo-500"></div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Budget</p>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <Wallet size={16} class="text-indigo-500 dark:text-indigo-400" />
          </div>
        </div>
        <p class="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {summary ? formatCurrency(summary.totalBudget) : '--'}
        </p>
      </div>
    </div>

    <!-- Spent -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <div class="border-t-4 border-t-red-500"></div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Spent</p>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
            <TrendingUp size={16} class="text-red-500 dark:text-red-400" />
          </div>
        </div>
        <p class="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {summary ? formatCurrency(summary.totalSpent) : '--'}
        </p>
      </div>
    </div>

    <!-- Committed -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <div class="border-t-4 border-t-amber-500"></div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Committed</p>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <Receipt size={16} class="text-amber-500 dark:text-amber-400" />
          </div>
        </div>
        <p class="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
          {summary ? formatCurrency(summary.totalCommitted) : '--'}
        </p>
      </div>
    </div>

    <!-- Remaining -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <div class="border-t-4 border-t-green-500"></div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Remaining</p>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
            <Shield size={16} class="text-green-500 dark:text-green-400" />
          </div>
        </div>
        <p class="mt-2 text-2xl font-bold tabular-nums {summary && summary.totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
          {summary ? formatCurrency(summary.totalRemaining) : '--'}
        </p>
      </div>
    </div>
  </div>

  <!-- Contingency bar -->
  {#if summary}
    {@const remainPct = contingencyRemainingPct(summary.contingencyUsed, summary.contingencyAmount)}
    {@const usedPct = budgetBarPct(summary.contingencyUsed, summary.contingencyAmount)}
    <div class="rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contingency</h2>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold {contingencyTextColor(summary.contingencyUsed, summary.contingencyAmount)} {remainPct > 10 ? 'bg-green-50 dark:bg-green-900/20' : remainPct >= 5 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
            {remainPct}% remaining
          </span>
        </div>
        <span class="text-sm text-zinc-500 dark:text-zinc-400">
          {formatCurrency(summary.contingencyUsed)} of {formatCurrency(summary.contingencyAmount)}
        </span>
      </div>
      <div class="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          class="h-3 rounded-full transition-all duration-500 {contingencyBarColor(summary.contingencyUsed, summary.contingencyAmount)}"
          style="width: {usedPct}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Category breakdown -->
  <div>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Category Breakdown</h2>
    {#if categories.length === 0}
      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <PiggyBank size={24} class="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">No budget categories yet</p>
          <p class="mt-1 max-w-xs text-xs text-zinc-400 dark:text-zinc-500">
            Categories will appear once your project budget is configured
          </p>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
        {#each categories as category, i}
          {@const allocated = category.allocatedAmount ?? 0}
          {@const spent = category.spentAmount ?? 0}
          {@const committed = category.committedAmount ?? 0}
          {@const total = spent + committed}
          {@const pct = budgetBarPct(total, allocated)}
          {@const spentPct = budgetBarPct(spent, allocated)}
          {@const committedPct = budgetBarPct(committed, allocated)}
          <div class="px-5 py-4 {i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800/50' : ''}">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{category.name}</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(total)}
                </span>
                {#if allocated > 0}
                  <span class="text-xs text-zinc-400">/ {formatCurrency(allocated)}</span>
                {/if}
              </div>
            </div>
            <!-- Stacked progress bar -->
            <div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
              {#if spentPct > 0}
                <div
                  class="h-2 bg-indigo-500 transition-all duration-500"
                  style="width: {spentPct}%"
                ></div>
              {/if}
              {#if committedPct > 0}
                <div
                  class="h-2 bg-amber-400 transition-all duration-500"
                  style="width: {committedPct}%"
                ></div>
              {/if}
            </div>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex gap-4 text-xs text-zinc-400">
                <span class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
                  Spent {formatCurrency(spent)}
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
                  Committed {formatCurrency(committed)}
                </span>
              </div>
              {#if allocated > 0}
                <span class="text-xs font-medium tabular-nums {pct >= 100 ? 'text-red-600 dark:text-red-400' : pct >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}">
                  {pct}% used
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { Wallet, TrendingUp, Shield, Receipt } from 'lucide-svelte';

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

  function formatCurrency(pence: number): string {
    const pounds = pence / 100;
    const sign = pounds < 0 ? '-' : '';
    const abs = Math.abs(pounds);
    const parts = abs.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sign}\u00A3${intPart}.${parts[1]}`;
  }

  function budgetBarPct(spent: number, allocated: number): number {
    if (!allocated || allocated <= 0) return 0;
    return Math.min(100, Math.round((spent / allocated) * 100));
  }

  function budgetBarColor(spent: number, allocated: number): string {
    const pct = budgetBarPct(spent, allocated);
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-indigo-500';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Budget</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track spending and allocations</p>
    </div>
    <a href="/budget/entries">
      <Button variant="secondary" size="sm">
        <Receipt size={16} />
        View Entries
      </Button>
    </a>
  </div>

  <!-- Overview cards -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30">
          <Wallet size={20} class="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Total Budget</p>
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {summary ? formatCurrency(summary.totalBudget) : '--'}
          </p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
          <TrendingUp size={20} class="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Spent</p>
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {summary ? formatCurrency(summary.totalSpent) : '--'}
          </p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
          <Receipt size={20} class="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Committed</p>
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {summary ? formatCurrency(summary.totalCommitted) : '--'}
          </p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
          <Shield size={20} class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Remaining</p>
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {summary ? formatCurrency(summary.totalRemaining) : '--'}
          </p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Contingency -->
  {#if summary}
    <Card>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contingency</h2>
        <span class="text-sm text-zinc-500">{formatCurrency(summary.contingencyUsed)} of {formatCurrency(summary.contingencyAmount)}</span>
      </div>
      <div class="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          class="h-2 rounded-full transition-all {budgetBarColor(summary.contingencyUsed, summary.contingencyAmount)}"
          style="width: {budgetBarPct(summary.contingencyUsed, summary.contingencyAmount)}%"
        ></div>
      </div>
      <p class="mt-1.5 text-xs text-zinc-400">
        {budgetBarPct(summary.contingencyUsed, summary.contingencyAmount)}% used
      </p>
    </Card>
  {/if}

  <!-- Category breakdown -->
  <div>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Category Breakdown</h2>
    {#if categories.length === 0}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Wallet size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No budget categories yet</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Categories will appear once your project budget is configured</p>
        </div>
      </Card>
    {:else}
      <Card padding="compact">
        <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
          {#each categories as category}
            {@const allocated = category.allocatedAmount ?? 0}
            {@const spent = category.spentAmount ?? 0}
            {@const committed = category.committedAmount ?? 0}
            {@const total = spent + committed}
            {@const pct = budgetBarPct(total, allocated)}
            <div class="px-3 py-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{category.name}</span>
                <div class="text-right">
                  <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(total)}</span>
                  {#if allocated > 0}
                    <span class="text-xs text-zinc-400"> / {formatCurrency(allocated)}</span>
                  {/if}
                </div>
              </div>
              <div class="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  class="h-1.5 rounded-full transition-all {budgetBarColor(total, allocated)}"
                  style="width: {pct}%"
                ></div>
              </div>
              <div class="mt-1 flex gap-4 text-xs text-zinc-400">
                <span>Spent: {formatCurrency(spent)}</span>
                <span>Committed: {formatCurrency(committed)}</span>
                {#if allocated > 0}
                  <span>{pct}%</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</div>

<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Wallet from 'lucide-svelte/icons/wallet';
  import TrendingUp from 'lucide-svelte/icons/trending-up';
  import Shield from 'lucide-svelte/icons/shield';
  import Receipt from 'lucide-svelte/icons/receipt';
  import PiggyBank from 'lucide-svelte/icons/piggy-bank';
  import Compass from 'lucide-svelte/icons/compass';
  import XIcon from 'lucide-svelte/icons/x';
  import Info from 'lucide-svelte/icons/info';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
  import Lightbulb from 'lucide-svelte/icons/lightbulb';

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

  // Feature A: "What's Next" dismissable
  let whatsNextDismissed = $state(false);

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

  // Feature F: Cost benchmarks
  const benchmarks: Record<string, { low: number; high: number; unit: string }> = {
    'Professional Fees': { low: 20000, high: 50000, unit: '\u00A3' },
    'Groundworks & Foundations': { low: 25000, high: 55000, unit: '\u00A3' },
    'Superstructure': { low: 45000, high: 120000, unit: '\u00A3' },
    'Roof': { low: 20000, high: 45000, unit: '\u00A3' },
    'First Fix': { low: 25000, high: 65000, unit: '\u00A3' },
    'Second Fix & Finishes': { low: 40000, high: 100000, unit: '\u00A3' },
    'External Works': { low: 15000, high: 45000, unit: '\u00A3' },
    'Utilities & Connections': { low: 8000, high: 20000, unit: '\u00A3' },
    'Contingency': { low: 35000, high: 70000, unit: '\u00A3' },
  };

  function formatBenchmark(val: number): string {
    return '\u00A3' + val.toLocaleString('en-GB');
  }

  function benchmarkStatus(allocated: number, low: number, high: number): 'below' | 'within' | 'above' {
    const allocPounds = allocated / 100;
    if (allocPounds < low) return 'below';
    if (allocPounds > high) return 'above';
    return 'within';
  }

  // Feature D: Smart budget warnings
  const budgetAdvice: Record<string, string> = {
    'Groundworks & Foundations': 'Ground conditions often surprise. If you\'re over here, review second fix finishes \u2014 this is where most people find savings.',
    'Superstructure': 'If structural costs are high, consider simpler external finishes to compensate.',
    'Second Fix & Finishes': 'This is where specification choices make the biggest difference. A simpler kitchen or standard bathroom fittings can save thousands.',
    'External Works': 'Landscaping can be phased \u2014 do the essentials now and improve over time.',
    'Professional Fees': 'Consider whether you need a full architect service for all remaining stages, or if a project manager would suffice.',
  };

  const hasEntries = $derived(categories.some(c => c.spentAmount > 0 || c.committedAmount > 0));
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

  <!-- Feature A: What's Next prompt -->
  {#if !whatsNextDismissed}
    <div class="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 py-3 px-4">
      <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60">
        <Compass size={14} class="text-zinc-500 dark:text-zinc-400" />
      </div>
      <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {#if !hasEntries}
          Start by logging your first expense or quote. Every invoice you record helps track your build costs and VAT reclaim.
        {:else}
          Keep logging every payment. Your budget accuracy improves with each entry.
        {/if}
      </p>
      <button
        onclick={() => (whatsNextDismissed = true)}
        class="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <XIcon size={14} />
      </button>
    </div>
  {/if}

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
      <!-- Feature E: Reassurance message near contingency -->
      <div class="mt-3 flex items-start gap-2">
        <Info size={13} class="text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5" />
        <p class="text-sm italic text-zinc-500 dark:text-zinc-400">
          87% of self-builders exceed their initial budget. A healthy contingency is your safety net, not a failure.
        </p>
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
          {@const benchmark = benchmarks[category.name]}
          {@const advice = budgetAdvice[category.name]}
          {@const showWarning = advice && allocated > 0 && pct >= 80}
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

            <!-- Feature F: Benchmark range -->
            {#if benchmark && allocated > 0}
              {@const bStatus = benchmarkStatus(allocated, benchmark.low, benchmark.high)}
              <div class="mt-2 flex items-center gap-1.5">
                {#if bStatus === 'within'}
                  <CircleCheck size={12} class="text-green-500 flex-shrink-0" />
                {:else if bStatus === 'below'}
                  <TriangleAlert size={12} class="text-amber-500 flex-shrink-0" />
                {:else}
                  <CircleCheck size={12} class="text-green-500 flex-shrink-0" />
                {/if}
                <span class="text-xs text-zinc-400 dark:text-zinc-500">
                  UK range: {formatBenchmark(benchmark.low)} &mdash; {formatBenchmark(benchmark.high)}
                </span>
              </div>
            {/if}

            <!-- Feature D: Smart budget warning -->
            {#if showWarning}
              <div class="mt-2.5 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-800/30 px-3 py-2">
                <Lightbulb size={13} class="text-amber-500 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-amber-700 dark:text-amber-400">
                  <span class="font-medium">Tip:</span> {advice}
                </p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import Diamond from 'lucide-svelte/icons/diamond';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import Wallet from 'lucide-svelte/icons/wallet';
  import Receipt from 'lucide-svelte/icons/receipt';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import Clock from 'lucide-svelte/icons/clock';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Shield from 'lucide-svelte/icons/shield';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import Info from 'lucide-svelte/icons/info';
  import MapPin from 'lucide-svelte/icons/map-pin';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import ChevronUp from 'lucide-svelte/icons/chevron-up';
  import PoundSterling from 'lucide-svelte/icons/pound-sterling';
  import BookOpen from 'lucide-svelte/icons/book-open';
  import Bug from 'lucide-svelte/icons/bug';
  import Plus from 'lucide-svelte/icons/plus';
  import FileCheck from 'lucide-svelte/icons/file-check';
  import Landmark from 'lucide-svelte/icons/landmark';

  interface Props {
    data: {
      project: {
        name: string;
        address: string;
        startDate: string | null;
        targetCompletion: string | null;
        totalBudget: number | null;
        contingencyPct: number | null;
        progress: number;
        currentPhase: string;
      } | null;
      alerts: Array<{
        id: string;
        priority: 'critical' | 'warning' | 'info';
        title: string;
        description: string;
        link: string;
      }>;
      budget: {
        total: number;
        spent: number;
        committed: number;
        remaining: number;
        contingencyRemaining: number;
        contingencyPct: number;
      } | null;
      recentTasks: Array<{
        id: string;
        title: string;
        status: string;
        dueDate: string | null;
      }>;
      milestones: Array<{
        id: string;
        title: string;
        dueDate: string | null;
        status: string;
      }>;
      snagCount: number;
      decisionCount: number;
      conditionCount: number;
      vatTotal: number;
    };
  }

  let { data }: Props = $props();

  let alertsExpanded = $state(false);

  let progress = $derived(data.project?.progress ?? 0);
  let currentPhase = $derived(data.project?.currentPhase ?? null);

  let daysIntoProject = $derived.by(() => {
    if (!data.project?.startDate) return 0;
    const start = new Date(data.project.startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  const phaseSegments = [
    { name: 'A', label: 'Pre-Construction', pct: 5 },
    { name: 'B', label: 'Groundworks', pct: 5 },
    { name: 'C', label: 'Foundations', pct: 8 },
    { name: 'D', label: 'Superstructure', pct: 15 },
    { name: 'E', label: 'Roof', pct: 10 },
    { name: 'F', label: 'First Fix', pct: 15 },
    { name: 'G', label: 'Plastering', pct: 7 },
    { name: 'H', label: 'Second Fix', pct: 15 },
    { name: 'I', label: 'External', pct: 8 },
    { name: 'J', label: 'Testing', pct: 7 },
    { name: 'K', label: 'Completion', pct: 5 },
  ];

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  }

  function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function contingencyColor(pct: number): string {
    if (pct > 10) return 'bg-green-500';
    if (pct >= 5) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function statusDotColor(status: string): string {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-amber-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-zinc-300 dark:bg-zinc-600';
    }
  }

  function alertBorderColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'warning': return 'border-l-amber-500';
      default: return 'border-l-blue-500';
    }
  }

  const circumference = 2 * Math.PI * 45;

  let spentPct = $derived(data.budget ? Math.round((data.budget.spent / Math.max(data.budget.total, 1)) * 100) : 0);
  let committedPct = $derived(data.budget ? Math.round((data.budget.committed / Math.max(data.budget.total, 1)) * 100) : 0);
  let remainingPct = $derived(Math.max(0, 100 - spentPct - committedPct));
</script>

<style>
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-in {
    animation: fadeInUp 0.4s ease-out both;
  }

  .animate-in-delay-1 {
    animation: fadeInUp 0.4s ease-out 0.05s both;
  }

  .animate-in-delay-2 {
    animation: fadeInUp 0.4s ease-out 0.1s both;
  }

  .animate-in-delay-3 {
    animation: fadeInUp 0.4s ease-out 0.15s both;
  }

  .progress-ring-gradient {
    stroke: url(#progressGradient);
  }
</style>

<div class="space-y-5">
  <!-- Hero Section -->
  <div class="animate-in rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 lg:p-6">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <!-- Left: Project Info -->
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {data.project?.name ?? 'Little Lodge'}
        </h1>
        <div class="mt-1.5 flex items-center gap-1.5">
          <MapPin size={14} class="shrink-0 text-zinc-400" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {data.project?.address ?? 'Grange View Road, N20'}
          </p>
        </div>
        {#if data.project?.startDate}
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Day <span class="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">{daysIntoProject}</span> of your build
          </p>
        {:else}
          <p class="mt-2 text-sm text-zinc-400 dark:text-zinc-500">Not started yet</p>
        {/if}

        {#if currentPhase}
          <div class="mt-1">
            <span class="inline-flex items-center rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-600 dark:bg-accent-950/40 dark:text-accent-400">
              {currentPhase}
            </span>
          </div>
        {/if}
      </div>

      <!-- Right: Progress Ring -->
      <div class="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 100" class="h-24 w-24 sm:h-28 sm:w-28">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: oklch(0.673 0.182 276.935)" />
              <stop offset="100%" style="stop-color: oklch(0.511 0.262 276.966)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            stroke-width="6"
            class="text-zinc-100 dark:text-zinc-800"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke-width="6"
            class="progress-ring-gradient"
            stroke-dasharray={circumference}
            stroke-dashoffset={circumference * (1 - progress / 100)}
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
            style="transition: stroke-dashoffset 0.6s ease-out;"
          />
          <text
            x="50" y="46"
            text-anchor="middle"
            dominant-baseline="central"
            class="fill-zinc-900 text-2xl font-semibold dark:fill-zinc-100"
          >{progress}%</text>
          <text
            x="50" y="62"
            text-anchor="middle"
            dominant-baseline="central"
            class="fill-zinc-400 dark:fill-zinc-500"
            style="font-size: 9px"
          >complete</text>
        </svg>
      </div>
    </div>

    <!-- Segmented Phase Bar -->
    <div class="mt-5">
      <div class="flex gap-0.5" title="Overall build progress">
        {#each phaseSegments as segment, i}
          {@const threshold = phaseSegments.slice(0, i + 1).reduce((s, p) => s + p.pct, 0)}
          {@const prevThreshold = phaseSegments.slice(0, i).reduce((s, p) => s + p.pct, 0)}
          {@const filled = progress >= threshold}
          {@const partial = !filled && progress > prevThreshold}
          <div
            class="group relative h-2 flex-1 rounded-sm transition-colors duration-300 first:rounded-l-md last:rounded-r-md {filled ? 'bg-accent-500' : partial ? 'bg-accent-300 dark:bg-accent-700' : 'bg-zinc-200 dark:bg-zinc-700/50'}"
          >
            <!-- Tooltip -->
            <div class="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
              {segment.name}: {segment.label}
            </div>
          </div>
        {/each}
      </div>
      <div class="mt-1.5 flex justify-between text-[10px] text-zinc-400">
        {#each phaseSegments as segment}
          <span class="w-0 text-center">{segment.name}</span>
        {/each}
      </div>
    </div>
  </div>

  <!-- Alert Banner -->
  {#if data.alerts.length > 0}
    <div class="animate-in-delay-1 rounded-xl border border-amber-200/60 bg-amber-50/50 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
      <button
        class="flex w-full items-center justify-between px-5 py-3 text-left"
        onclick={() => (alertsExpanded = !alertsExpanded)}
      >
        <div class="flex items-center gap-2.5">
          <AlertTriangle size={16} class="text-amber-600 dark:text-amber-400" />
          <span class="text-sm font-medium text-amber-800 dark:text-amber-300">
            {data.alerts.length} {data.alerts.length === 1 ? 'item needs' : 'items need'} attention
          </span>
        </div>
        {#if alertsExpanded}
          <ChevronUp size={16} class="text-amber-600 dark:text-amber-400" />
        {:else}
          <ChevronDown size={16} class="text-amber-600 dark:text-amber-400" />
        {/if}
      </button>

      {#if alertsExpanded}
        <div class="space-y-2 px-5 pb-4">
          {#each data.alerts as alert}
            <a
              href={alert.link}
              class="block rounded-lg border-l-[3px] bg-white/70 p-3 transition-colors duration-200 hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 {alertBorderColor(alert.priority)}"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{alert.title}</p>
                  <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{alert.description}</p>
                </div>
                <ArrowRight size={14} class="mt-0.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Three-Column Grid -->
  <div class="grid gap-5 lg:grid-cols-3">
    <!-- Column 1: Schedule -->
    <div class="space-y-5">
      <!-- This Week -->
      <div class="animate-in-delay-1 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">This Week</p>
          <a href="/timeline" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">View all</a>
        </div>
        {#if data.recentTasks.length > 0}
          <div class="space-y-1">
            {#each data.recentTasks.slice(0, 5) as task}
              <a href="/timeline" class="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span class="h-2 w-2 shrink-0 rounded-full {statusDotColor(task.status)}"></span>
                <span class="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">{task.title}</span>
                {#if task.dueDate}
                  <span class="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                {/if}
              </a>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays size={28} class="mb-2 text-zinc-200 dark:text-zinc-700" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">No tasks this week</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Upcoming tasks will show here</p>
          </div>
        {/if}
      </div>

      <!-- Milestones -->
      <div class="animate-in-delay-2 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Milestones</p>
          <a href="/timeline" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">View all</a>
        </div>
        {#if data.milestones.length > 0}
          <div class="space-y-3">
            {#each data.milestones.slice(0, 3) as milestone}
              <a href="/timeline" class="flex items-start gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <Diamond size={14} class="mt-0.5 shrink-0 text-accent-500" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{milestone.title}</p>
                  {#if milestone.dueDate}
                    {@const days = daysUntil(milestone.dueDate)}
                    <p class="mt-0.5 text-xs tabular-nums {days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}">
                      {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Today' : `${days} days remaining`}
                    </p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <Diamond size={28} class="mb-2 text-zinc-200 dark:text-zinc-700" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">No milestones set</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Key milestones will appear here</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Column 2: Money -->
    <div class="space-y-5">
      <!-- Budget -->
      <div class="animate-in-delay-1 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Budget</p>
          <a href="/budget" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">Details</a>
        </div>
        {#if data.budget}
          <p class="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatCurrency(data.budget.total)}
          </p>
          <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Total budget</p>

          <!-- Stacked horizontal bar -->
          <div class="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            {#if spentPct > 0}
              <div
                class="h-full bg-accent-500 transition-all duration-500"
                style="width: {spentPct}%"
                title="Spent: {formatCurrency(data.budget.spent)}"
              ></div>
            {/if}
            {#if committedPct > 0}
              <div
                class="h-full bg-amber-400 transition-all duration-500"
                style="width: {committedPct}%"
                title="Committed: {formatCurrency(data.budget.committed)}"
              ></div>
            {/if}
          </div>

          <!-- Legend + stats -->
          <div class="mt-3 grid grid-cols-3 gap-3">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-accent-500"></span>
                <span class="text-[10px] text-zinc-400">Spent</span>
              </div>
              <p class="mt-0.5 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.spent)}</p>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-amber-400"></span>
                <span class="text-[10px] text-zinc-400">Committed</span>
              </div>
              <p class="mt-0.5 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(data.budget.committed)}</p>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
                <span class="text-[10px] text-zinc-400">Remaining</span>
              </div>
              <p class="mt-0.5 text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">{formatCurrency(data.budget.remaining)}</p>
            </div>
          </div>
        {:else}
          <p class="text-2xl font-semibold text-zinc-200 dark:text-zinc-700">--</p>
          <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Total budget</p>
          <div class="mt-4 h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800"></div>
          <div class="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p class="text-[10px] text-zinc-400">Spent</p>
              <p class="mt-0.5 text-sm font-semibold text-zinc-200 dark:text-zinc-700">--</p>
            </div>
            <div>
              <p class="text-[10px] text-zinc-400">Committed</p>
              <p class="mt-0.5 text-sm font-semibold text-zinc-200 dark:text-zinc-700">--</p>
            </div>
            <div>
              <p class="text-[10px] text-zinc-400">Remaining</p>
              <p class="mt-0.5 text-sm font-semibold text-zinc-200 dark:text-zinc-700">--</p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Contingency mini card -->
      <div class="animate-in-delay-2 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Contingency</p>
          {#if data.budget}
            <span class="text-xs font-medium tabular-nums {data.budget.contingencyPct > 10 ? 'text-green-600 dark:text-green-400' : data.budget.contingencyPct >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}">
              {data.budget.contingencyPct}% remaining
            </span>
          {:else}
            <span class="text-xs text-zinc-400 dark:text-zinc-500">--</span>
          {/if}
        </div>
        <div class="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          {#if data.budget}
            <div
              class="h-full rounded-full transition-all duration-500 {contingencyColor(data.budget.contingencyPct)}"
              style="width: {Math.min(data.budget.contingencyPct, 100)}%"
            ></div>
          {/if}
        </div>
      </div>

      <!-- VAT Reclaimable mini card -->
      <div class="animate-in-delay-3 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">VAT Reclaimable</p>
          <a href="/vat" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">Details</a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
            <Receipt size={20} class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {data.vatTotal ? formatCurrency(data.vatTotal) : '--'}
            </p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">DIY Housebuilders scheme</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 3: Actions -->
    <div class="space-y-5">
      <!-- Decisions -->
      <div class="animate-in-delay-1 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Decisions</p>
          <a href="/decisions" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">View all</a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-950/30">
            <GitBranch size={20} class="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.decisionCount}</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">Pending decisions</p>
          </div>
          <a href="/decisions" class="ml-auto">
            <ArrowRight size={16} class="text-zinc-300 transition-transform duration-200 hover:translate-x-0.5 dark:text-zinc-600" />
          </a>
        </div>
      </div>

      <!-- Planning -->
      <div class="animate-in-delay-2 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Planning</p>
          <a href="/planning" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400 transition-colors duration-200">View all</a>
        </div>
        <div class="space-y-3">
          <!-- Conditions -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Shield size={20} class="text-amber-600 dark:text-amber-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Conditions</p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">
                {data.conditionCount} undischarged
              </p>
            </div>
          </div>
          <!-- CIL -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Landmark size={20} class="text-blue-600 dark:text-blue-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">CIL</p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Self-build exemption</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="animate-in-delay-3 rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
        <p class="mb-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Quick Actions</p>
        <div class="space-y-2">
          <a
            href="/budget"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-accent-50 dark:bg-accent-950/30">
              <PoundSterling size={16} class="text-accent-600 dark:text-accent-400" />
            </div>
            Log Expense
          </a>
          <a
            href="/diary"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
              <BookOpen size={16} class="text-blue-600 dark:text-blue-400" />
            </div>
            Diary Entry
          </a>
          <a
            href="/snags"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/30">
              <Bug size={16} class="text-red-600 dark:text-red-400" />
            </div>
            Report Snag
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Row: Quick Stats -->
  <div class="grid gap-5 sm:grid-cols-3 animate-in-delay-3">
    <a href="/snags" class="group rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-colors duration-200 hover:bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
            <AlertTriangle size={18} class="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Open Snags</p>
            <p class="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.snagCount}</p>
          </div>
        </div>
        <ArrowRight size={16} class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-600" />
      </div>
    </a>

    <a href="/decisions" class="group rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-colors duration-200 hover:bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-950/30">
            <GitBranch size={18} class="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Decisions</p>
            <p class="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.decisionCount}</p>
          </div>
        </div>
        <ArrowRight size={16} class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-600" />
      </div>
    </a>

    <a href="/planning" class="group rounded-xl border border-zinc-200/50 bg-white p-5 shadow-sm transition-colors duration-200 hover:bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <Shield size={18} class="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Conditions</p>
            <p class="text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.conditionCount}</p>
          </div>
        </div>
        <ArrowRight size={16} class="text-zinc-300 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-600" />
      </div>
    </a>
  </div>
</div>

<script lang="ts">
  import Diamond from 'lucide-svelte/icons/diamond';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import Wallet from 'lucide-svelte/icons/wallet';
  import Receipt from 'lucide-svelte/icons/receipt';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Shield from 'lucide-svelte/icons/shield';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';

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
      alerts: Array<{ id: string; priority: string; title: string; description: string; link: string }>;
      budget: { total: number; spent: number; committed: number; remaining: number; contingencyRemaining: number; contingencyPct: number } | null;
      recentTasks: Array<{ id: string; title: string; status: string; dueDate: string | null }>;
      milestones: Array<{ id: string; title: string; dueDate: string | null; status: string }>;
      snagCount: number;
      decisionCount: number;
      conditionCount: number;
      vatTotal: number;
      nextActions: any[];
      phaseGuidance: any;
      currentPhase: string | null;
      progress: number;
    };
  }

  let { data }: Props = $props();

  let progress = $derived(data.project?.progress ?? 0);
  let currentPhase = $derived(data.project?.currentPhase ?? 'Phase A: Pre-Construction');

  let daysIntoProject = $derived.by(() => {
    if (!data.project?.startDate) return 0;
    return Math.floor((Date.now() - new Date(data.project.startDate).getTime()) / 86400000);
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

  function formatCurrency(pence: number): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(pence / 100);
  }

  function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  }

  function statusDot(status: string): string {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-amber-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-zinc-400 dark:bg-zinc-600';
    }
  }

  const circumference = 2 * Math.PI * 45;
  const card = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/80';
  const cardHover = card + ' transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600/50';
</script>

<div class="space-y-5">
  <!-- Hero -->
  <div class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-800/90">
    <div class="flex items-center justify-between gap-8">
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Current Phase</p>
        <h1 class="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{currentPhase}</h1>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {daysIntoProject > 0 ? `Day ${daysIntoProject} of your build` : 'Not started yet'}
        </p>

        <!-- Phase bar -->
        <div class="mt-5 flex gap-0.5">
          {#each phaseSegments as segment, i}
            {@const cumulativePct = phaseSegments.slice(0, i + 1).reduce((s, p) => s + p.pct, 0)}
            {@const filled = progress >= cumulativePct}
            {@const partial = !filled && progress > phaseSegments.slice(0, i).reduce((s, p) => s + p.pct, 0)}
            <div
              class="h-2 flex-1 rounded-[3px] first:rounded-l-md last:rounded-r-md {filled ? 'bg-green-500' : partial ? 'bg-accent-500' : 'bg-zinc-200 dark:bg-zinc-700/60'}"
              title="{segment.name}: {segment.label}"
            ></div>
          {/each}
        </div>
        <div class="mt-1 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>A</span>
          <span>K</span>
        </div>
      </div>

      <!-- Progress ring -->
      <div class="flex shrink-0 flex-col items-center gap-1">
        <svg viewBox="0 0 100 100" class="h-[72px] w-[72px]">
          <circle cx="50" cy="50" r="45" fill="none" stroke-width="8" class="stroke-zinc-100 dark:stroke-zinc-700/50" />
          <circle cx="50" cy="50" r="45" fill="none" stroke-width="8"
            class="stroke-indigo-500"
            stroke-dasharray={circumference}
            stroke-dashoffset={circumference * (1 - progress / 100)}
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
            style="transition: stroke-dashoffset 1s ease-out"
          />
          <text x="50" y="47" text-anchor="middle" dominant-baseline="central" class="fill-zinc-900 dark:fill-zinc-100 text-xl font-semibold">{progress}%</text>
          <text x="50" y="64" text-anchor="middle" class="fill-zinc-400 dark:fill-zinc-500 text-[8px] uppercase tracking-wider">Complete</text>
        </svg>
      </div>
    </div>
  </div>

  <!-- Row 1: Milestones | Budget | Alerts -->
  <div class="grid gap-5 lg:grid-cols-3">

    <!-- Next Milestones -->
    <a href="/timeline" class="{cardHover} group">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Next Milestones</p>
        <span class="text-xs text-indigo-500 dark:text-indigo-400">View all</span>
      </div>
      {#if data.milestones.length > 0}
        <div class="space-y-3">
          {#each data.milestones.slice(0, 3) as milestone}
            <div class="flex items-start gap-3">
              <Diamond size={14} class="mt-0.5 shrink-0 text-accent-400" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{milestone.title}</p>
                {#if milestone.dueDate}
                  {@const days = daysUntil(milestone.dueDate)}
                  <p class="text-xs {days < 0 ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}">{days < 0 ? `${Math.abs(days)}d overdue` : `${days} days`}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-5 text-center">
          <Diamond size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-400 dark:text-zinc-500">No milestones set</p>
          <p class="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">Key milestones will appear here</p>
        </div>
      {/if}
    </a>

    <!-- Budget -->
    <a href="/budget" class="{cardHover} group">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Budget</p>
        <span class="text-xs text-indigo-500 dark:text-indigo-400">Details</span>
      </div>
      {#if data.budget && data.budget.total > 0}
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Total Budget</p>
            <p class="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.total)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Spent</p>
            <p class="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.spent)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Committed</p>
            <p class="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{formatCurrency(data.budget.committed)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Remaining</p>
            <p class="text-sm tabular-nums text-green-600 dark:text-green-400">{formatCurrency(data.budget.remaining)}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center justify-between text-[10px]">
            <span class="uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Contingency</span>
          </div>
          <div class="mt-1 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div class="h-1.5 rounded-full bg-green-500 transition-all duration-500" style="width: {Math.min(data.budget.contingencyPct, 100)}%"></div>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center py-5 text-center">
          <Wallet size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-400 dark:text-zinc-500">--</p>
        </div>
      {/if}
    </a>

    <!-- Alerts -->
    <div class="{card}">
      <div class="mb-4">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Alerts</p>
      </div>
      {#if data.alerts.length > 0}
        <div class="space-y-2 max-h-44 overflow-y-auto">
          {#each data.alerts.slice(0, 5) as alert}
            <a href={alert.link} class="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full {alert.priority === 'critical' ? 'bg-red-500' : alert.priority === 'warning' ? 'bg-amber-500' : 'bg-blue-400'}"></span>
              <p class="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{alert.title}</p>
            </a>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-5 text-center">
          <CircleCheck size={28} class="mb-2 text-green-400 dark:text-green-500" />
          <p class="text-sm text-zinc-400 dark:text-zinc-500">All clear</p>
          <p class="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">Deadline warnings and compliance alerts will appear here</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Row 2: This Week | VAT | Decisions -->
  <div class="grid gap-5 lg:grid-cols-3">

    <!-- This Week -->
    <a href="/timeline" class="{cardHover} group">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">This Week</p>
        <span class="text-xs text-indigo-500 dark:text-indigo-400">View all</span>
      </div>
      {#if data.recentTasks.length > 0}
        <div class="space-y-2.5">
          {#each data.recentTasks.slice(0, 4) as task}
            <div class="flex items-center gap-3">
              <span class="h-2 w-2 shrink-0 rounded-full {statusDot(task.status)}"></span>
              <span class="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">{task.title}</span>
              {#if task.dueDate}
                <span class="shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-5 text-center">
          <CalendarDays size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-400 dark:text-zinc-500">No tasks this week</p>
          <p class="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">Upcoming tasks will show here</p>
        </div>
      {/if}
    </a>

    <!-- VAT Reclaimable -->
    <a href="/vat" class="{cardHover} group">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">VAT Reclaimable</p>
        <span class="text-xs text-indigo-500 dark:text-indigo-400">Details</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
          <Receipt size={20} class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.vatTotal ? formatCurrency(data.vatTotal) : '--'}</p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500">Total reclaimable via DIY Housebuilders scheme</p>
        </div>
      </div>
    </a>

    <!-- Upcoming Decisions -->
    <a href="/decisions" class="{cardHover} group">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Upcoming Decisions</p>
        <span class="text-xs text-indigo-500 dark:text-indigo-400">View all</span>
      </div>
      {#if data.decisionCount > 0}
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 dark:bg-indigo-900/30">
            <GitBranch size={20} class="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <p class="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.decisionCount}</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">Pending decisions</p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center py-5 text-center">
          <GitBranch size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-400 dark:text-zinc-500">No pending decisions</p>
          <p class="mt-0.5 text-xs text-zinc-300 dark:text-zinc-600">Choices needing your input will appear here</p>
        </div>
      {/if}
    </a>
  </div>

  <!-- Bottom row: Next Inspection + stats -->
  <div class="grid gap-4 sm:grid-cols-3">
    <a href="/snags" class="group flex items-center justify-between {card} !py-4 transition-shadow duration-200 hover:shadow-md">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30">
          <AlertTriangle size={16} class="text-red-500 dark:text-red-400" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Open Snags</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.snagCount}</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>

    <a href="/planning" class="group flex items-center justify-between {card} !py-4 transition-shadow duration-200 hover:shadow-md">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
          <Shield size={16} class="text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Conditions</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.conditionCount}</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>

    <a href="/inspections" class="group flex items-center justify-between {card} !py-4 transition-shadow duration-200 hover:shadow-md">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
          <ClipboardCheck size={16} class="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Inspections</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">17</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>
  </div>
</div>

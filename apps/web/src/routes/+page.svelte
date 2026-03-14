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
  import MapPin from 'lucide-svelte/icons/map-pin';
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

  const phaseSegments = [
    { name: 'A', label: 'Pre-Construction' },
    { name: 'B', label: 'Groundworks' },
    { name: 'C', label: 'Foundations' },
    { name: 'D', label: 'Superstructure' },
    { name: 'E', label: 'Roof' },
    { name: 'F', label: 'First Fix' },
    { name: 'G', label: 'Plastering' },
    { name: 'H', label: 'Second Fix' },
    { name: 'I', label: 'External' },
    { name: 'J', label: 'Testing' },
    { name: 'K', label: 'Completion' },
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
      default: return 'bg-zinc-300 dark:bg-zinc-600';
    }
  }

  const circumference = 2 * Math.PI * 45;
</script>

<div class="space-y-6">
  <!-- Hero -->
  <div class="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
    <div class="flex items-center justify-between gap-6">
      <div class="min-w-0 flex-1">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Current Phase</p>
        <h1 class="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{currentPhase}</h1>
        <div class="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <MapPin size={13} />
          <span>{data.project?.address ?? 'Grange View Road, N20 9EF'}</span>
        </div>

        <!-- Phase bar -->
        <div class="mt-5 flex gap-1" title="Build progress">
          {#each phaseSegments as segment, i}
            {@const segmentProgress = (i / phaseSegments.length) * 100}
            <div
              class="h-2 flex-1 rounded-sm transition-colors duration-500 {progress > segmentProgress ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}"
              title="{segment.name}: {segment.label}"
            ></div>
          {/each}
        </div>
        <div class="mt-1.5 flex justify-between text-[10px] text-zinc-400">
          <span>A</span>
          <span>K</span>
        </div>
      </div>

      <!-- Progress ring -->
      <div class="flex shrink-0 flex-col items-center">
        <svg viewBox="0 0 100 100" class="h-20 w-20">
          <circle cx="50" cy="50" r="45" fill="none" stroke-width="7" class="stroke-zinc-200 dark:stroke-zinc-700" />
          <circle cx="50" cy="50" r="45" fill="none" stroke-width="7"
            class="stroke-indigo-500"
            stroke-dasharray={circumference}
            stroke-dashoffset={circumference * (1 - progress / 100)}
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
            style="transition: stroke-dashoffset 1s ease-out"
          />
          <text x="50" y="48" text-anchor="middle" dominant-baseline="central" class="fill-zinc-900 dark:fill-zinc-100 text-lg font-semibold">{progress}%</text>
          <text x="50" y="63" text-anchor="middle" class="fill-zinc-400 text-[8px]">complete</text>
        </svg>
      </div>
    </div>
  </div>

  <!-- Three-column grid -->
  <div class="grid gap-5 lg:grid-cols-3">
    <!-- Milestones -->
    <a href="/timeline" class="group rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Next Milestones</p>
        <span class="text-xs text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">View all</span>
      </div>
      {#if data.milestones.length > 0}
        <div class="space-y-3">
          {#each data.milestones.slice(0, 3) as milestone}
            <div class="flex items-start gap-3">
              <Diamond size={14} class="mt-0.5 shrink-0 text-indigo-400" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{milestone.title}</p>
                {#if milestone.dueDate}
                  {@const days = daysUntil(milestone.dueDate)}
                  <p class="text-xs {days < 0 ? 'text-red-500' : 'text-zinc-400'}">{days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-6 text-center">
          <Diamond size={24} class="mb-2 text-zinc-200 dark:text-zinc-700" />
          <p class="text-sm text-zinc-400">No milestones set</p>
        </div>
      {/if}
    </a>

    <!-- Budget -->
    <a href="/budget" class="group rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Budget</p>
        <span class="text-xs text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">Details</span>
      </div>
      {#if data.budget}
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p class="text-[10px] uppercase text-zinc-400">Total</p>
            <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.total)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase text-zinc-400">Spent</p>
            <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.spent)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase text-zinc-400">Committed</p>
            <p class="text-sm font-medium tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(data.budget.committed)}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase text-zinc-400">Remaining</p>
            <p class="text-sm font-medium tabular-nums text-green-600 dark:text-green-400">{formatCurrency(data.budget.remaining)}</p>
          </div>
        </div>
        <!-- Contingency -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-[10px]">
            <span class="uppercase text-zinc-400">Contingency</span>
            <span class="font-medium {data.budget.contingencyPct > 10 ? 'text-green-600' : data.budget.contingencyPct >= 5 ? 'text-amber-600' : 'text-red-600'}">{data.budget.contingencyPct}% remaining</span>
          </div>
          <div class="mt-1 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div class="h-1.5 rounded-full transition-all duration-500 {data.budget.contingencyPct > 10 ? 'bg-green-500' : data.budget.contingencyPct >= 5 ? 'bg-amber-500' : 'bg-red-500'}" style="width: {Math.min(data.budget.contingencyPct, 100)}%"></div>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center py-6 text-center">
          <Wallet size={24} class="mb-2 text-zinc-200 dark:text-zinc-700" />
          <p class="text-sm text-zinc-400">Budget not configured</p>
        </div>
      {/if}
    </a>

    <!-- Alerts -->
    <div class="rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Alerts</p>
      </div>
      {#if data.alerts.length > 0}
        <div class="space-y-2.5 max-h-48 overflow-y-auto">
          {#each data.alerts.slice(0, 5) as alert}
            <a href={alert.link} class="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <span class="mt-1 h-2 w-2 shrink-0 rounded-full {alert.priority === 'critical' ? 'bg-red-500' : alert.priority === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}"></span>
              <p class="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{alert.title}</p>
            </a>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-6 text-center">
          <CircleCheck size={24} class="mb-2 text-green-300 dark:text-green-700" />
          <p class="text-sm text-zinc-400">All clear</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Second row -->
  <div class="grid gap-5 lg:grid-cols-3">
    <!-- This Week -->
    <a href="/timeline" class="group rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">This Week</p>
        <span class="text-xs text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">View all</span>
      </div>
      {#if data.recentTasks.length > 0}
        <div class="space-y-2">
          {#each data.recentTasks.slice(0, 4) as task}
            <div class="flex items-center gap-3">
              <span class="h-2 w-2 shrink-0 rounded-full {statusDot(task.status)}"></span>
              <span class="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">{task.title}</span>
              {#if task.dueDate}
                <span class="shrink-0 text-[11px] tabular-nums text-zinc-400">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center py-6 text-center">
          <CalendarDays size={24} class="mb-2 text-zinc-200 dark:text-zinc-700" />
          <p class="text-sm text-zinc-400">No tasks this week</p>
        </div>
      {/if}
    </a>

    <!-- VAT Reclaimable -->
    <a href="/vat" class="group rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">VAT Reclaimable</p>
        <span class="text-xs text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">Details</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
          <Receipt size={20} class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.vatTotal ? formatCurrency(data.vatTotal) : '£0'}</p>
          <p class="text-xs text-zinc-400">Via DIY Housebuilders scheme</p>
        </div>
      </div>
    </a>

    <!-- Upcoming Decisions -->
    <a href="/decisions" class="group rounded-xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Decisions</p>
        <span class="text-xs text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">View all</span>
      </div>
      {#if data.decisionCount > 0}
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
            <GitBranch size={20} class="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.decisionCount}</p>
            <p class="text-xs text-zinc-400">Pending decisions</p>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center py-6 text-center">
          <GitBranch size={24} class="mb-2 text-zinc-200 dark:text-zinc-700" />
          <p class="text-sm text-zinc-400">No pending decisions</p>
        </div>
      {/if}
    </a>
  </div>

  <!-- Bottom stats -->
  <div class="grid gap-4 sm:grid-cols-3">
    <a href="/snags" class="group flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
          <AlertTriangle size={16} class="text-red-500" />
        </div>
        <div>
          <p class="text-xs text-zinc-400">Open Snags</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.snagCount}</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>

    <a href="/planning" class="group flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
          <Shield size={16} class="text-amber-500" />
        </div>
        <div>
          <p class="text-xs text-zinc-400">Conditions</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{data.conditionCount}</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>

    <a href="/inspections" class="group flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <ClipboardCheck size={16} class="text-blue-500" />
        </div>
        <div>
          <p class="text-xs text-zinc-400">Inspections</p>
          <p class="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">17</p>
        </div>
      </div>
      <ArrowRight size={14} class="text-zinc-200 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-700" />
    </a>
  </div>
</div>

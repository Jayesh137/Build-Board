<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Diamond from 'lucide-svelte/icons/diamond';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import Wallet from 'lucide-svelte/icons/wallet';
  import TrendingUp from 'lucide-svelte/icons/trending-up';
  import Receipt from 'lucide-svelte/icons/receipt';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import Clock from 'lucide-svelte/icons/clock';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Shield from 'lucide-svelte/icons/shield';
  import CheckCircle from 'lucide-svelte/icons/circle-check';
  import Info from 'lucide-svelte/icons/info';

  interface Props {
    data: {
      project: {
        name: string;
        address: string;
        startDate: string | null;
        targetCompletion: string | null;
        totalBudget: number | null;
        contingencyPct: number | null;
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

  // Computed values
  let progress = $derived(data.project ? 12 : 0);
  let currentPhase = $derived(data.project ? 'Phase A: Pre-Construction' : null);
  let daysIntoProject = $derived(() => {
    if (!data.project?.startDate) return 0;
    const start = new Date(data.project.startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  // Phase segments for the progress bar
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
    }).format(amount);
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

  const circumference = 2 * Math.PI * 45;
</script>

<div class="space-y-6">
  <!-- Top Strip: Phase Progress -->
  <Card>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1">
        {#if currentPhase}
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Current Phase</p>
          <h1 class="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{currentPhase}</h1>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Day {daysIntoProject()} of your build</p>
        {:else}
          <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Welcome to</p>
          <h1 class="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Build Dashboard</h1>
          <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="/setup" class="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">Set up your project</a> to start tracking progress
          </p>
        {/if}

        <!-- Segmented progress bar -->
        <div class="mt-4 flex gap-0.5" title="Overall build progress">
          {#each phaseSegments as segment, i}
            {@const filled = progress >= phaseSegments.slice(0, i + 1).reduce((s, p) => s + p.pct, 0)}
            {@const partial = !filled && progress > phaseSegments.slice(0, i).reduce((s, p) => s + p.pct, 0)}
            <div
              class="h-2 flex-1 rounded-sm first:rounded-l-md last:rounded-r-md {filled ? 'bg-accent-500' : partial ? 'bg-accent-300 dark:bg-accent-700' : 'bg-zinc-200 dark:bg-zinc-700'}"
              title="{segment.name}: {segment.label}"
            ></div>
          {/each}
        </div>
        <div class="mt-1 flex justify-between text-[10px] text-zinc-400">
          <span>A</span>
          <span>K</span>
        </div>
      </div>

      <!-- Progress Ring -->
      <div class="flex flex-col items-center gap-1">
        <svg viewBox="0 0 100 100" class="h-20 w-20">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8" class="text-zinc-200 dark:text-zinc-700" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="8"
            class="text-accent-500"
            stroke-dasharray={circumference}
            stroke-dashoffset={circumference * (1 - progress / 100)}
            stroke-linecap="round"
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="50" text-anchor="middle" dominant-baseline="central" class="fill-zinc-900 dark:fill-zinc-100 text-xl font-semibold">{progress}%</text>
        </svg>
        <span class="text-xs text-zinc-400 dark:text-zinc-500">Complete</span>
      </div>
    </div>
  </Card>

  <!-- Main Three-Column Layout -->
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Left Column -->
    <div class="space-y-6">
      <!-- Next Milestones -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Next Milestones</h2>
          <a href="/timeline" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">View all</a>
        </div>
        {#if data.milestones.length > 0}
          <div class="space-y-3">
            {#each data.milestones.slice(0, 3) as milestone}
              <a href="/timeline" class="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <Diamond size={16} class="mt-0.5 shrink-0 text-accent-500" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{milestone.title}</p>
                  {#if milestone.dueDate}
                    {@const days = daysUntil(milestone.dueDate)}
                    <p class="text-xs {days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}">
                      {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Today' : `${days} days`}
                    </p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <Diamond size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">No milestones set</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Key milestones will appear here</p>
          </div>
        {/if}
      </Card>

      <!-- This Week -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">This Week</h2>
          <a href="/timeline" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">View all</a>
        </div>
        {#if data.recentTasks.length > 0}
          <div class="space-y-1">
            {#each data.recentTasks.slice(0, 5) as task}
              <a href="/timeline" class="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <span class="h-2 w-2 shrink-0 rounded-full {statusDotColor(task.status)}"></span>
                <span class="flex-1 min-w-0 truncate text-sm text-zinc-700 dark:text-zinc-300">{task.title}</span>
                {#if task.dueDate}
                  <span class="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                {/if}
              </a>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <CalendarDays size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">No tasks this week</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Upcoming tasks will show here</p>
          </div>
        {/if}
      </Card>

      <!-- Next Inspection -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Next Inspection</h2>
          <a href="/inspections" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">View all</a>
        </div>
        <div class="flex flex-col items-center justify-center py-6 text-center">
          <ClipboardCheck size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No inspections scheduled</p>
          <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Building control and warranty visits will appear here</p>
        </div>
      </Card>
    </div>

    <!-- Centre Column -->
    <div class="space-y-6">
      <!-- Budget Summary -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Budget</h2>
          <a href="/budget" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">Details</a>
        </div>
        {#if data.budget}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Total Budget</p>
              <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.total)}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Spent</p>
              <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(data.budget.spent)}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Committed</p>
              <p class="text-lg font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(data.budget.committed)}</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Remaining</p>
              <p class="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(data.budget.remaining)}</p>
            </div>
          </div>

          <!-- Contingency Bar -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-500 dark:text-zinc-400">Contingency</span>
              <span class="font-medium {data.budget.contingencyPct > 10 ? 'text-green-600 dark:text-green-400' : data.budget.contingencyPct >= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}">
                {data.budget.contingencyPct}% remaining
              </span>
            </div>
            <div class="mt-1 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                class="h-2 rounded-full transition-all {contingencyColor(data.budget.contingencyPct)}"
                style="width: {Math.min(data.budget.contingencyPct, 100)}%"
              ></div>
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Total Budget</p>
              <p class="text-lg font-semibold text-zinc-300 dark:text-zinc-600">--</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Spent</p>
              <p class="text-lg font-semibold text-zinc-300 dark:text-zinc-600">--</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Committed</p>
              <p class="text-lg font-semibold text-zinc-300 dark:text-zinc-600">--</p>
            </div>
            <div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500">Remaining</p>
              <p class="text-lg font-semibold text-zinc-300 dark:text-zinc-600">--</p>
            </div>
          </div>

          <!-- Empty contingency bar -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-zinc-500 dark:text-zinc-400">Contingency</span>
              <span class="text-zinc-400 dark:text-zinc-500">--</span>
            </div>
            <div class="mt-1 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        {/if}
      </Card>

      <!-- VAT Reclaimable -->
      <Card>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">VAT Reclaimable</h2>
          <a href="/vat" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">Details</a>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
            <Receipt size={20} class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {data.vatTotal ? formatCurrency(data.vatTotal) : '--'}
            </p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">Total reclaimable via DIY Housebuilders scheme</p>
          </div>
        </div>
      </Card>

      <!-- Monthly Spend -->
      <Card>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Monthly Spend</h2>
          <a href="/budget" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">Details</a>
        </div>
        <div class="flex flex-col items-center justify-center py-6 text-center">
          <TrendingUp size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No spend data yet</p>
          <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Monthly spend chart will appear once payments are logged</p>
        </div>
      </Card>
    </div>

    <!-- Right Column -->
    <div class="space-y-6">
      <!-- Alert Feed -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alerts</h2>
          {#if data.alerts.length > 0}
            <Badge variant="critical">{data.alerts.length}</Badge>
          {/if}
        </div>
        {#if data.alerts.length > 0}
          <div class="max-h-72 space-y-2 overflow-y-auto">
            {#each data.alerts as alert}
              <a href={alert.link} class="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
                {#if alert.priority === 'critical'}
                  <AlertTriangle size={16} class="mt-0.5 shrink-0 text-red-500" />
                {:else if alert.priority === 'warning'}
                  <Clock size={16} class="mt-0.5 shrink-0 text-amber-500" />
                {:else}
                  <Info size={16} class="mt-0.5 shrink-0 text-blue-500" />
                {/if}
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{alert.title}</p>
                    <Badge variant={alert.priority === 'critical' ? 'critical' : alert.priority === 'warning' ? 'warning' : 'info'} size="sm">
                      {alert.priority}
                    </Badge>
                  </div>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{alert.description}</p>
                </div>
                <ArrowRight size={14} class="mt-1 shrink-0 text-zinc-300 dark:text-zinc-600" />
              </a>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle size={28} class="mb-2 text-green-300 dark:text-green-700" />
            <p class="text-sm text-zinc-500 dark:text-zinc-400">All clear</p>
            <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Deadline warnings and compliance alerts will appear here</p>
          </div>
        {/if}
      </Card>

      <!-- Upcoming Decisions -->
      <Card>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Decisions</h2>
          <a href="/decisions" class="text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400">View all</a>
        </div>
        <div class="flex flex-col items-center justify-center py-6 text-center">
          <GitBranch size={28} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No pending decisions</p>
          <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Choices needing your input will appear here</p>
        </div>
      </Card>
    </div>
  </div>

  <!-- Bottom Strip: Quick Stats -->
  <div class="grid gap-4 sm:grid-cols-3">
    <a href="/snags" class="group">
      <Card interactive>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
              <AlertTriangle size={18} class="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Open Snags</p>
              <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{data.snagCount}</p>
            </div>
          </div>
          <ArrowRight size={16} class="text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
        </div>
      </Card>
    </a>

    <a href="/decisions" class="group">
      <Card interactive>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-accent-100 dark:bg-accent-900/30">
              <GitBranch size={18} class="text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Pending Decisions</p>
              <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{data.decisionCount}</p>
            </div>
          </div>
          <ArrowRight size={16} class="text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
        </div>
      </Card>
    </a>

    <a href="/planning" class="group">
      <Card interactive>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Shield size={18} class="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Undischarged Conditions</p>
              <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{data.conditionCount}</p>
            </div>
          </div>
          <ArrowRight size={16} class="text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
        </div>
      </Card>
    </a>
  </div>
</div>

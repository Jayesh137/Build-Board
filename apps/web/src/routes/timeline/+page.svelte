<script lang="ts">
  import { enhance } from '$app/forms';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import TaskRow from '$lib/components/TaskRow.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import Search from 'lucide-svelte/icons/search';
  import ListChecks from 'lucide-svelte/icons/list-checks';
  import X from 'lucide-svelte/icons/x';
  import Lightbulb from 'lucide-svelte/icons/lightbulb';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import Clock from 'lucide-svelte/icons/clock';
  import BookOpen from 'lucide-svelte/icons/book-open';


  interface Phase {
    id: string;
    name: string;
    sortOrder: number;
    status: string;
    tasks?: Task[];
  }

  interface Task {
    id: string;
    phaseId: string;
    title: string;
    status: 'not_started' | 'in_progress' | 'blocked' | 'done';
    dueDate: string | null;
    assigneeId: string | null;
    isMilestone: boolean;
    sortOrder: number;
  }

  interface KeyDecision {
    title: string;
    why: string;
    leadTime: string;
  }

  interface PhaseGuidanceData {
    phaseName: string;
    summary: string;
    whatToFocus: string[];
    tips: { content: string; importance: string }[];
    commonMistakes: string[];
    keyDecisions: KeyDecision[];
  }

  let { data, form } = $props();

  const phases: Phase[] = data.phases ?? [];
  const phaseGuidance: PhaseGuidanceData | null = data.phaseGuidance ?? null;
  const currentPhaseName: string | null = data.currentPhaseName ?? null;

  // Phase briefing state
  let briefingExpanded = $state(true);
  let mistakesExpanded = $state(false);
  let tipExpanded = $state(false);

  // Filter state
  let searchQuery = $state('');
  let filterPhase = $state('');
  let filterStatus = $state('');

  // Collapsible phase state
  let expandedPhases = $state<Set<string>>(new Set(phases.map((p: Phase) => p.id)));

  // Modal state
  let showAddTask = $state(false);
  let newTaskPhaseId = $state('');

  function togglePhase(phaseId: string) {
    const next = new Set(expandedPhases);
    if (next.has(phaseId)) {
      next.delete(phaseId);
    } else {
      next.add(phaseId);
    }
    expandedPhases = next;
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'done', label: 'Done' },
  ];

  const phaseOptions = $derived([
    { value: '', label: 'All Phases' },
    ...phases.map((p: Phase) => ({ value: p.id, label: p.name })),
  ]);

  const newTaskStatusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'done', label: 'Done' },
  ];

  const filteredPhases = $derived(
    phases
      .filter((p: Phase) => !filterPhase || p.id === filterPhase)
      .map((p: Phase) => ({
        ...p,
        tasks: (p.tasks ?? []).filter((t: Task) => {
          const matchesStatus = !filterStatus || t.status === filterStatus;
          const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesStatus && matchesSearch;
        }),
      }))
  );

  const totalTasks = $derived(phases.reduce((sum: number, p: Phase) => sum + (p.tasks?.length ?? 0), 0));
  const completedTasks = $derived(
    phases.reduce((sum: number, p: Phase) => sum + (p.tasks?.filter((t: Task) => t.status === 'done').length ?? 0), 0)
  );

  function openAddTask(phaseId?: string) {
    newTaskPhaseId = phaseId ?? phases[0]?.id ?? '';
    showAddTask = true;
  }

  function phaseBorderColor(phase: Phase): string {
    const tasks = phase.tasks ?? [];
    if (tasks.length === 0) return 'border-l-zinc-300 dark:border-l-zinc-600';
    const allDone = tasks.every((t: Task) => t.status === 'done');
    const anyInProgress = tasks.some((t: Task) => t.status === 'in_progress');
    if (allDone) return 'border-l-green-500';
    if (anyInProgress) return 'border-l-indigo-500';
    return 'border-l-zinc-300 dark:border-l-zinc-600';
  }

  function phaseProgress(phase: Phase): number {
    const tasks = phase.tasks ?? [];
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t: Task) => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }

  const firstTip = $derived(phaseGuidance?.tips?.[0] ?? null);
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Timeline</h1>
      <p class="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        {completedTasks} of {totalTasks} tasks complete
      </p>
    </div>
    <button
      onclick={() => openAddTask()}
      class="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:bg-accent-500 dark:hover:bg-accent-600"
    >
      <Plus size={16} />
      Add Task
    </button>
  </div>

  <!-- Phase Briefing Card -->
  {#if phaseGuidance}
    <div class="relative rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <!-- Gradient left border -->
      <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-violet-500"></div>

      {#if briefingExpanded}
        <!-- Dismiss button -->
        <button
          onclick={() => (briefingExpanded = false)}
          class="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-400 z-10"
          title="Minimize guide"
        >
          <X size={16} />
        </button>

        <div class="pl-5 pr-12 py-5 space-y-5">
          <!-- Phase header -->
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <BookOpen size={15} class="text-indigo-500 dark:text-indigo-400" />
              <span class="text-[11px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-semibold">Phase Guide</span>
            </div>
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">{phaseGuidance.phaseName}</h2>
            <p class="mt-1 text-sm italic text-zinc-500 dark:text-zinc-400 leading-relaxed">{phaseGuidance.summary}</p>
          </div>

          <!-- What to focus on -->
          <div>
            <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium mb-2.5">What to focus on</p>
            <ul class="space-y-2">
              {#each phaseGuidance.whatToFocus as item}
                <li class="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>

          <!-- Tip card -->
          {#if firstTip}
            <div>
              <button
                onclick={() => (tipExpanded = !tipExpanded)}
                class="w-full text-left"
              >
                <div class="rounded-lg bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 px-4 py-3 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <div class="flex items-center gap-2">
                    <Lightbulb size={15} class="text-amber-500 flex-shrink-0" />
                    <span class="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-medium">Tip</span>
                    <span
                      class="ml-auto transition-transform duration-200 text-amber-400"
                      class:rotate-180={tipExpanded}
                    >
                      <ChevronDown size={14} />
                    </span>
                  </div>
                  {#if tipExpanded}
                    <p class="mt-2 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{firstTip.content}</p>
                  {/if}
                </div>
              </button>
            </div>
          {/if}

          <!-- Common mistakes (collapsible) -->
          {#if phaseGuidance.commonMistakes.length > 0}
            <div>
              <button
                onclick={() => (mistakesExpanded = !mistakesExpanded)}
                class="flex items-center gap-2 text-left group w-full"
              >
                <AlertTriangle size={14} class="text-red-400 dark:text-red-500 flex-shrink-0" />
                <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Common mistakes to avoid</span>
                <span
                  class="ml-1 transition-transform duration-200 text-zinc-300 dark:text-zinc-600"
                  class:rotate-180={mistakesExpanded}
                >
                  <ChevronDown size={14} />
                </span>
              </button>
              {#if mistakesExpanded}
                <div class="mt-2.5 space-y-1.5">
                  {#each phaseGuidance.commonMistakes as mistake}
                    <div class="flex items-start gap-2.5 rounded-lg bg-red-50/60 dark:bg-red-900/10 border border-red-100/60 dark:border-red-900/20 px-3 py-2.5">
                      <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                      <span class="text-sm text-red-700 dark:text-red-400">{mistake}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Key decisions with lead times -->
          {#if phaseGuidance.keyDecisions.length > 0}
            <div>
              <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium mb-2.5">Key decisions</p>
              <div class="space-y-2">
                {#each phaseGuidance.keyDecisions as decision}
                  <div class="flex items-start justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60 px-3.5 py-2.5">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200">{decision.title}</p>
                      <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{decision.why}</p>
                    </div>
                    <span class="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex-shrink-0 whitespace-nowrap">
                      <Clock size={11} />
                      {decision.leadTime}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Collapsed state -->
        <button
          onclick={() => (briefingExpanded = true)}
          class="flex w-full items-center gap-3 pl-5 pr-4 py-3 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
        >
          <BookOpen size={15} class="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{phaseGuidance.phaseName}</span>
          <span class="text-xs text-indigo-500 dark:text-indigo-400 font-medium hover:underline ml-auto">Show guide</span>
        </button>
      {/if}
    </div>
  {/if}

  <!-- Filter bar -->
  <div class="rounded-xl border border-zinc-200/50 bg-white p-3 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search size={16} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          bind:value={searchQuery}
          class="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 h-9 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800"
        />
      </div>
      <select
        bind:value={filterPhase}
        class="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 h-9 text-sm text-zinc-700 transition-colors focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:focus:bg-zinc-800"
      >
        {#each phaseOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <select
        bind:value={filterStatus}
        class="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 h-9 text-sm text-zinc-700 transition-colors focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:focus:bg-zinc-800"
      >
        {#each statusOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Phases and tasks -->
  {#if filteredPhases.length === 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <ListChecks size={24} class="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p class="text-sm font-medium text-zinc-600 dark:text-zinc-400">No phases found</p>
        <p class="mt-1 max-w-xs text-xs text-zinc-400 dark:text-zinc-500">
          Tasks will appear here once your project phases are set up. Get started by adding your first task.
        </p>
      </div>
    </div>
  {:else}
    <div class="space-y-3">
      {#each filteredPhases as phase}
        {@const progress = phaseProgress(phase)}
        {@const taskCount = phase.tasks?.length ?? 0}
        {@const isExpanded = expandedPhases.has(phase.id)}
        <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm border-l-4 {phaseBorderColor(phase)} dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
          <!-- Phase header -->
          <button
            class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
            onclick={() => togglePhase(phase.id)}
          >
            <span
              class="flex-shrink-0 transition-transform duration-200 text-zinc-400"
              class:rotate-0={!isExpanded}
              class:-rotate-180={isExpanded}
              style="transform-origin: center;"
            >
              <ChevronDown size={16} />
            </span>
            <span class="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {phase.name}
            </span>
            <span class="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
            {#if taskCount > 0}
              <span class="text-xs font-medium tabular-nums {progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'}">
                {progress}%
              </span>
            {/if}
          </button>

          <!-- Tasks -->
          {#if isExpanded}
            <div class="border-t border-zinc-100 dark:border-zinc-800/50">
              {#if taskCount === 0}
                <div class="px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No tasks in this phase yet
                </div>
              {:else}
                {#each phase.tasks ?? [] as task}
                  <TaskRow
                    href="/timeline/{task.id}"
                    title={task.title}
                    status={task.status}
                    dueDate={task.dueDate}
                    isMilestone={task.isMilestone}
                  />
                {/each}
              {/if}
              <button
                class="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800/30 dark:hover:text-zinc-300"
                onclick={() => openAddTask(phase.id)}
              >
                <Plus size={14} />
                Add task to {phase.name}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Task Modal -->
<Modal bind:open={showAddTask} title="Add Task">
  <form method="POST" action="?/createTask" use:enhance class="space-y-4">
    <input type="hidden" name="phaseId" value={newTaskPhaseId} />

    <Select
      label="Phase"
      name="phaseId"
      options={phases.map((p: Phase) => ({ value: p.id, label: p.name }))}
      bind:value={newTaskPhaseId}
    />

    <Input label="Title" name="title" required placeholder="e.g. Foundation pour" />

    <Textarea label="Description" name="description" placeholder="Optional details..." rows={3} />

    <Select
      label="Status"
      name="status"
      options={newTaskStatusOptions}
    />

    <Input label="Due Date" name="dueDate" type="date" />

    <Input label="Assignee ID" name="assigneeId" placeholder="Contact ID (optional)" />

    <div class="flex items-center gap-2">
      <input type="checkbox" id="isMilestone" name="isMilestone" value="true" class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
      <label for="isMilestone" class="text-sm text-zinc-700 dark:text-zinc-300">Milestone</label>
    </div>

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showAddTask = false)}>Cancel</Button>
      <Button type="submit">Create Task</Button>
    </div>
  </form>
</Modal>

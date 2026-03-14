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

  let { data, form } = $props();

  const phases: Phase[] = data.phases ?? [];

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

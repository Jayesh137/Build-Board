<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import TaskRow from '$lib/components/TaskRow.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { Plus, ChevronDown, ChevronRight, Search, Filter } from 'lucide-svelte';

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
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Timeline</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {completedTasks} of {totalTasks} tasks complete
      </p>
    </div>
    <Button onclick={() => openAddTask()} size="sm">
      <Plus size={16} />
      Add Task
    </Button>
  </div>

  <!-- Filter bar -->
  <Card padding="compact">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          bind:value={searchQuery}
          class="block w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 h-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <Filter size={16} class="text-zinc-400" />
        <select
          bind:value={filterPhase}
          class="rounded-md border border-zinc-200 bg-white px-3 h-9 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {#each phaseOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
        <select
          bind:value={filterStatus}
          class="rounded-md border border-zinc-200 bg-white px-3 h-9 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {#each statusOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </Card>

  <!-- Phases and tasks -->
  {#if filteredPhases.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No phases found</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Tasks will appear here once your project is set up</p>
      </div>
    </Card>
  {:else}
    <div class="space-y-3">
      {#each filteredPhases as phase}
        <Card padding="compact">
          <!-- Phase header -->
          <button
            class="flex w-full items-center gap-3 px-1 py-2 text-left"
            onclick={() => togglePhase(phase.id)}
          >
            {#if expandedPhases.has(phase.id)}
              <ChevronDown size={16} class="flex-shrink-0 text-zinc-400" />
            {:else}
              <ChevronRight size={16} class="flex-shrink-0 text-zinc-400" />
            {/if}
            <span class="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {phase.name}
            </span>
            <StatusBadge status={phase.status} />
            <span class="text-xs text-zinc-400">
              {phase.tasks?.length ?? 0} tasks
            </span>
          </button>

          <!-- Tasks -->
          {#if expandedPhases.has(phase.id)}
            <div class="mt-1">
              {#if (phase.tasks?.length ?? 0) === 0}
                <div class="px-3 py-4 text-center text-xs text-zinc-400">
                  No tasks in this phase
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
                class="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                onclick={() => openAddTask(phase.id)}
              >
                <Plus size={14} />
                Add task to {phase.name}
              </button>
            </div>
          {/if}
        </Card>
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

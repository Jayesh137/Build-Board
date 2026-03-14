<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import Link from 'lucide-svelte/icons/link';
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import Diamond from 'lucide-svelte/icons/diamond';

  interface Task {
    id: string;
    phaseId: string;
    title: string;
    description: string | null;
    status: 'not_started' | 'in_progress' | 'blocked' | 'done';
    assigneeId: string | null;
    startDate: string | null;
    dueDate: string | null;
    actualStart: string | null;
    actualEnd: string | null;
    isMilestone: boolean;
    inspectionRequired: boolean;
    notes: string | null;
    createdAt: string;
  }

  interface Dependency {
    id: string;
    taskId: string;
    dependsOnTaskId: string;
    title?: string;
    status?: string;
    direction: 'depends_on' | 'depended_by';
  }

  interface Inspection {
    id: string;
    name: string;
    type: string;
    status: string;
    scheduledDate: string | null;
  }

  let { data, form } = $props();

  const task: Task | null = data.task;
  const dependencies: Dependency[] = data.dependencies ?? [];
  const inspection: Inspection | null = data.inspection;

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'done', label: 'Done' },
  ];

  const dependsOn = $derived(dependencies.filter((d: Dependency) => d.direction === 'depends_on'));
  const dependedBy = $derived(dependencies.filter((d: Dependency) => d.direction === 'depended_by'));
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/timeline" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
    <ArrowLeft size={16} />
    Back to Timeline
  </a>

  {#if !task}
    <Card>
      <div class="py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Task not found</p>
      </div>
    </Card>
  {:else}
    <!-- Task detail & edit form -->
    <Card>
      <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</h1>
        </div>
        <StatusBadge status={task.status} size="md" />
      </div>

      <form method="POST" action="?/update" use:enhance class="space-y-4">
        <Input label="Title" name="title" value={task.title} required />

        <Textarea label="Description" name="description" value={task.description ?? ''} rows={3} placeholder="Task details..." />

        <div class="grid gap-4 sm:grid-cols-2">
          <Select label="Status" name="status" options={statusOptions} value={task.status} />
          <Input label="Assignee ID" name="assigneeId" value={task.assigneeId ?? ''} placeholder="Contact ID" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Start Date" name="startDate" type="date" value={task.startDate ?? ''} />
          <Input label="Due Date" name="dueDate" type="date" value={task.dueDate ?? ''} />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Actual Start" name="actualStart" type="date" value={task.actualStart ?? ''} disabled />
          <Input label="Actual End" name="actualEnd" type="date" value={task.actualEnd ?? ''} disabled />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="isMilestone"
            name="isMilestone"
            value="true"
            checked={task.isMilestone}
            class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="isMilestone" class="text-sm text-zinc-700 dark:text-zinc-300">Milestone</label>
        </div>

        <Textarea label="Notes" name="notes" value={task.notes ?? ''} rows={3} placeholder="Additional notes..." />

        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}
        {#if form?.success}
          <p class="text-sm text-green-600">Task updated successfully</p>
        {/if}

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button variant="secondary" type="button" onclick={() => history.back()}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>

    <!-- Dependencies -->
    <Card>
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <span class="inline-flex items-center gap-2">
          <Link size={16} />
          Dependencies
        </span>
      </h2>

      {#if dependencies.length === 0}
        <p class="py-4 text-center text-xs text-zinc-400">No dependencies</p>
      {:else}
        {#if dependsOn.length > 0}
          <div class="mb-4">
            <p class="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">This task depends on</p>
            <div class="space-y-1">
              {#each dependsOn as dep}
                <a
                  href="/timeline/{dep.dependsOnTaskId}"
                  class="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <span class="text-zinc-900 dark:text-zinc-100">{dep.title ?? dep.dependsOnTaskId}</span>
                  {#if dep.status}
                    <StatusBadge status={dep.status} />
                  {/if}
                </a>
              {/each}
            </div>
          </div>
        {/if}

        {#if dependedBy.length > 0}
          <div>
            <p class="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Blocks these tasks</p>
            <div class="space-y-1">
              {#each dependedBy as dep}
                <a
                  href="/timeline/{dep.taskId}"
                  class="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <span class="text-zinc-900 dark:text-zinc-100">{dep.title ?? dep.taskId}</span>
                  {#if dep.status}
                    <StatusBadge status={dep.status} />
                  {/if}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </Card>

    <!-- Linked Inspection -->
    {#if task.inspectionRequired || inspection}
      <Card>
        <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <span class="inline-flex items-center gap-2">
            <ClipboardCheck size={16} />
            Linked Inspection
          </span>
        </h2>

        {#if inspection}
          <a
            href="/inspections/{inspection.id}"
            class="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            <div>
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{inspection.name}</p>
              <p class="mt-0.5 text-xs text-zinc-500">
                {inspection.type === 'building_control' ? 'Building Control' : inspection.type === 'warranty' ? 'Warranty' : 'Other'}
                {#if inspection.scheduledDate}
                  &middot; {inspection.scheduledDate}
                {/if}
              </p>
            </div>
            <StatusBadge status={inspection.status} />
          </a>
        {:else}
          <p class="py-4 text-center text-xs text-zinc-400">Inspection required but not yet linked</p>
        {/if}
      </Card>
    {/if}
  {/if}
</div>

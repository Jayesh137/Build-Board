<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { ArrowLeft, ClipboardCheck, CalendarDays, User } from 'lucide-svelte';

  interface Inspection {
    id: string;
    name: string;
    type: 'building_control' | 'warranty' | 'other';
    linkedTaskId: string | null;
    linkedTaskTitle?: string | null;
    status: 'not_needed' | 'due' | 'booked' | 'passed' | 'conditional' | 'failed';
    scheduledDate: string | null;
    resultNotes: string | null;
    inspector: string | null;
    isCustom: boolean;
    sortOrder: number;
    createdAt: string;
  }

  let { data, form } = $props();

  const inspection: Inspection | null = data.inspection;

  const statusOptions = [
    { value: 'not_needed', label: 'Not Needed' },
    { value: 'due', label: 'Due' },
    { value: 'booked', label: 'Booked' },
    { value: 'passed', label: 'Passed' },
    { value: 'conditional', label: 'Conditional Pass' },
    { value: 'failed', label: 'Failed' },
  ];

  const typeLabels: Record<string, string> = {
    building_control: 'Building Control',
    warranty: 'Warranty',
    other: 'Other',
  };

  const typeBadgeVariant: Record<string, 'info' | 'warning' | 'not_started'> = {
    building_control: 'info',
    warranty: 'warning',
    other: 'not_started',
  };

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  // Result form selection for quick pass/conditional/fail
  let resultAction = $state('');
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/inspections" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
    <ArrowLeft size={16} />
    Back to Inspections
  </a>

  {#if !inspection}
    <Card>
      <div class="py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Inspection not found</p>
      </div>
    </Card>
  {:else}
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <ClipboardCheck size={22} class="text-indigo-500" />
          <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{inspection.name}</h1>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <Badge variant={typeBadgeVariant[inspection.type] ?? 'not_started'}>
            {typeLabels[inspection.type] ?? inspection.type}
          </Badge>
          <StatusBadge status={inspection.status} size="md" />
        </div>
      </div>
    </div>

    <!-- Info cards -->
    <div class="grid gap-3 sm:grid-cols-3">
      <Card padding="compact">
        <div class="flex items-center gap-2">
          <CalendarDays size={14} class="text-zinc-400" />
          <div>
            <p class="text-xs text-zinc-400">Scheduled Date</p>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {inspection.scheduledDate ? formatDate(inspection.scheduledDate) : 'Not scheduled'}
            </p>
          </div>
        </div>
      </Card>
      <Card padding="compact">
        <div class="flex items-center gap-2">
          <User size={14} class="text-zinc-400" />
          <div>
            <p class="text-xs text-zinc-400">Inspector</p>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {inspection.inspector ?? 'Not assigned'}
            </p>
          </div>
        </div>
      </Card>
      {#if inspection.linkedTaskId}
        <Card padding="compact">
          <div>
            <p class="text-xs text-zinc-400">Linked Task</p>
            <a
              href="/timeline/{inspection.linkedTaskId}"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {inspection.linkedTaskTitle ?? 'View task'}
            </a>
          </div>
        </Card>
      {/if}
    </div>

    <!-- Quick result buttons -->
    {#if inspection.status === 'booked' || inspection.status === 'due'}
      <Card>
        <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Record Result</h2>
        <div class="flex gap-3">
          <form method="POST" action="?/update" use:enhance>
            <input type="hidden" name="status" value="passed" />
            <input type="hidden" name="scheduledDate" value={inspection.scheduledDate ?? ''} />
            <input type="hidden" name="inspector" value={inspection.inspector ?? ''} />
            <Button type="submit" size="sm" variant="secondary">
              <span class="h-2 w-2 rounded-full bg-green-500"></span>
              Pass
            </Button>
          </form>
          <form method="POST" action="?/update" use:enhance>
            <input type="hidden" name="status" value="conditional" />
            <input type="hidden" name="scheduledDate" value={inspection.scheduledDate ?? ''} />
            <input type="hidden" name="inspector" value={inspection.inspector ?? ''} />
            <Button type="submit" size="sm" variant="secondary">
              <span class="h-2 w-2 rounded-full bg-amber-500"></span>
              Conditional
            </Button>
          </form>
          <form method="POST" action="?/update" use:enhance>
            <input type="hidden" name="status" value="failed" />
            <input type="hidden" name="scheduledDate" value={inspection.scheduledDate ?? ''} />
            <input type="hidden" name="inspector" value={inspection.inspector ?? ''} />
            <Button type="submit" size="sm" variant="danger">
              <span class="h-2 w-2 rounded-full bg-red-500"></span>
              Fail
            </Button>
          </form>
        </div>
      </Card>
    {/if}

    <!-- Edit form -->
    <Card>
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inspection Details</h2>

      <form method="POST" action="?/update" use:enhance class="space-y-4">
        <Select label="Status" name="status" options={statusOptions} value={inspection.status} />

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Scheduled Date" name="scheduledDate" type="date" value={inspection.scheduledDate ?? ''} />
          <Input label="Inspector" name="inspector" value={inspection.inspector ?? ''} placeholder="Inspector name" />
        </div>

        <Textarea
          label="Result Notes"
          name="resultNotes"
          value={inspection.resultNotes ?? ''}
          rows={4}
          placeholder="Notes from the inspection result..."
        />

        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}
        {#if form?.success}
          <p class="text-sm text-green-600">Inspection updated successfully</p>
        {/if}

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button variant="secondary" type="button" onclick={() => history.back()}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>
  {/if}
</div>

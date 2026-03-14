<script lang="ts">
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import Info from 'lucide-svelte/icons/info';
  import ExternalLink from 'lucide-svelte/icons/external-link';
  import Calendar from 'lucide-svelte/icons/calendar';

  interface Inspection {
    id: string;
    name: string;
    type: 'building_control' | 'warranty' | 'other';
    linkedTaskId: string | null;
    linkedTaskTitle?: string | null;
    status: 'not_needed' | 'due' | 'booked' | 'passed' | 'conditional' | 'failed';
    scheduledDate: string | null;
    sortOrder: number;
  }

  let { data } = $props();

  const inspections: Inspection[] = data.inspections ?? [];

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    not_needed: {
      label: 'Not Needed',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-600 dark:text-zinc-400',
      border: 'border-l-zinc-300 dark:border-l-zinc-600',
      dot: 'bg-zinc-400',
    },
    due: {
      label: 'Due',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-l-amber-400 dark:border-l-amber-500',
      dot: 'bg-amber-500',
    },
    booked: {
      label: 'Booked',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-l-blue-400 dark:border-l-blue-500',
      dot: 'bg-blue-500',
    },
    passed: {
      label: 'Passed',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-l-green-500 dark:border-l-green-500',
      dot: 'bg-green-500',
    },
    conditional: {
      label: 'Conditional',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-l-amber-400 dark:border-l-amber-500',
      dot: 'bg-amber-500',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-l-red-500 dark:border-l-red-500',
      dot: 'bg-red-500',
    },
  };

  const typeConfig: Record<string, { label: string; classes: string }> = {
    building_control: {
      label: 'Building Control',
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-200/50 dark:ring-blue-800/50',
    },
    warranty: {
      label: 'Warranty',
      classes: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 ring-1 ring-purple-200/50 dark:ring-purple-800/50',
    },
    other: {
      label: 'Other',
      classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50',
    },
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Inspections</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
      {inspections.length} inspection{inspections.length !== 1 ? 's' : ''} tracked
    </p>
  </div>

  <!-- Info banner -->
  <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-blue-500 dark:border-l-blue-500">
    <div class="flex items-start gap-3 p-4 lg:p-5">
      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <ClipboardCheck size={18} class="text-blue-600 dark:text-blue-400" />
      </div>
      <div class="min-w-0 pt-0.5">
        <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Booking tip</p>
        <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Building Control inspections can be booked same-day &mdash; call before 10am for a visit that afternoon.
        </p>
      </div>
    </div>
  </div>

  <!-- Inspections list -->
  {#if inspections.length === 0}
    <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm">
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <ClipboardCheck size={24} class="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p class="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No inspections yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Inspections will appear as your build progresses
        </p>
      </div>
    </div>
  {:else}
    <div>
      <p class="mb-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Inspection Schedule</p>

      <div class="space-y-2">
        {#each inspections as inspection}
          {@const status = statusConfig[inspection.status] ?? statusConfig.not_needed}
          {@const type = typeConfig[inspection.type] ?? typeConfig.other}
          <a
            href="/inspections/{inspection.id}"
            class="group block rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm border-l-4 {status.border} transition-all hover:shadow-md"
          >
            <div class="flex items-center gap-4 p-4">
              <!-- Main content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3 flex-wrap">
                  <p class="font-medium text-zinc-900 dark:text-zinc-100">{inspection.name}</p>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {type.classes}">
                    {type.label}
                  </span>
                </div>

                <div class="mt-1.5 flex items-center gap-4 text-sm">
                  {#if inspection.linkedTaskId}
                    <span class="inline-flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline">
                      <ExternalLink size={12} />
                      <span class="truncate max-w-[200px]">{inspection.linkedTaskTitle ?? 'Linked task'}</span>
                    </span>
                  {/if}

                  {#if inspection.scheduledDate}
                    <span class="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Calendar size={12} />
                      {formatDate(inspection.scheduledDate)}
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Status badge -->
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {status.bg} {status.text}">
                  <span class="h-1.5 w-1.5 rounded-full {status.dot}"></span>
                  {status.label}
                </span>
                <ChevronRight size={16} class="text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

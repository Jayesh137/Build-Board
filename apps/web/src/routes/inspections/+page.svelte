<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { ClipboardCheck, ChevronRight, Info } from 'lucide-svelte';

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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  const typeBadge: Record<string, { variant: 'info' | 'warning' | 'not_started'; label: string }> = {
    building_control: { variant: 'info', label: 'BC' },
    warranty: { variant: 'warning', label: 'Warranty' },
    other: { variant: 'not_started', label: 'Other' },
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Inspections</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Building control and warranty inspections</p>
  </div>

  <!-- BC note -->
  <Card padding="compact">
    <div class="flex items-start gap-3 px-1 py-1">
      <Info size={16} class="mt-0.5 flex-shrink-0 text-indigo-500" />
      <div>
        <p class="text-sm text-zinc-700 dark:text-zinc-300">
          Building Control inspections are required at key stages of your build. Your Building Control body must be notified before starting work and at each inspection stage. Book inspections at least 24 hours in advance.
        </p>
      </div>
    </div>
  </Card>

  <!-- Inspections table -->
  {#if inspections.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardCheck size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No inspections yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Inspections will appear as tasks with inspections are created</p>
      </div>
    </Card>
  {:else}
    <Card padding="compact">
      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800">
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Inspection</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Type</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Linked Task</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Scheduled</th>
              <th class="px-3 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            {#each inspections as inspection}
              {@const typeInfo = typeBadge[inspection.type]}
              <tr class="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td class="px-3 py-2.5">
                  <a href="/inspections/{inspection.id}" class="font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400">
                    {inspection.name}
                  </a>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <Badge variant={typeInfo?.variant ?? 'not_started'}>
                    {typeInfo?.label ?? inspection.type}
                  </Badge>
                </td>
                <td class="px-3 py-2.5">
                  {#if inspection.linkedTaskId}
                    <a
                      href="/timeline/{inspection.linkedTaskId}"
                      class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {inspection.linkedTaskTitle ?? 'View task'}
                    </a>
                  {:else}
                    <span class="text-zinc-400">-</span>
                  {/if}
                </td>
                <td class="px-3 py-2.5 text-center">
                  <StatusBadge status={inspection.status} />
                </td>
                <td class="whitespace-nowrap px-3 py-2.5 text-zinc-500">
                  {inspection.scheduledDate ? formatDate(inspection.scheduledDate) : '-'}
                </td>
                <td class="px-3 py-2.5">
                  <a href="/inspections/{inspection.id}">
                    <ChevronRight size={16} class="text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {#each inspections as inspection}
          {@const typeInfo = typeBadge[inspection.type]}
          <a
            href="/inspections/{inspection.id}"
            class="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div class="flex-1 min-w-0 space-y-1">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{inspection.name}</p>
              <div class="flex items-center gap-2">
                <Badge variant={typeInfo?.variant ?? 'not_started'}>
                  {typeInfo?.label ?? inspection.type}
                </Badge>
                <StatusBadge status={inspection.status} />
                {#if inspection.scheduledDate}
                  <span class="text-xs text-zinc-400">{formatDate(inspection.scheduledDate)}</span>
                {/if}
              </div>
            </div>
            <ChevronRight size={16} class="flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
          </a>
        {/each}
      </div>
    </Card>
  {/if}
</div>

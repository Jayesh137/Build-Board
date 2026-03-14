<script lang="ts">
  import ChevronRight from 'lucide-svelte/icons/chevron-right';

  interface Props {
    href: string;
    title: string;
    status: 'not_started' | 'in_progress' | 'blocked' | 'done';
    dueDate?: string | null;
    assignee?: string | null;
    isMilestone?: boolean;
  }

  let { href, title, status, dueDate, assignee, isMilestone = false }: Props = $props();

  const statusColors: Record<string, string> = {
    done: 'bg-green-500',
    in_progress: 'bg-amber-500',
    not_started: 'bg-zinc-300 dark:bg-zinc-600',
    blocked: 'bg-red-500',
  };

  function formatDueDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  function isOverdue(iso: string): boolean {
    const today = new Date();
    const [year, month, day] = iso.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    return due < today && status !== 'done';
  }
</script>

<a
  {href}
  class="group flex min-h-[44px] items-center gap-3 border-b border-zinc-200 px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
>
  <!-- Status circle -->
  <span class="flex h-4 w-4 flex-shrink-0 items-center justify-center">
    <span class="h-3 w-3 rounded-full {statusColors[status]}"></span>
  </span>

  <!-- Title -->
  <span class="flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
    {title}
  </span>

  <!-- Due date -->
  {#if dueDate}
    <span class="flex-shrink-0 text-xs {isOverdue(dueDate) ? 'font-medium text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}">
      {formatDueDate(dueDate)}
    </span>
  {/if}

  <!-- Assignee -->
  {#if assignee}
    <span class="hidden flex-shrink-0 text-xs text-zinc-500 dark:text-zinc-400 sm:block">
      {assignee}
    </span>
  {/if}

  <!-- Chevron -->
  <ChevronRight size={16} class="flex-shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
</a>

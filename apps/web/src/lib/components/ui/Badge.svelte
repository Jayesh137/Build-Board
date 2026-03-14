<script lang="ts">
  interface Props {
    variant?: 'done' | 'in_progress' | 'not_started' | 'blocked' | 'overdue' | 'info' | 'warning' | 'critical';
    size?: 'sm' | 'md';
    class?: string;
    children: import('svelte').Snippet;
  }

  let { variant = 'not_started', size = 'sm', class: className = '', children }: Props = $props();

  const variants: Record<string, string> = {
    done: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
    not_started: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50',
    blocked: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50',
    overdue: 'bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-600',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
    critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-sm',
  };
</script>

<span class="inline-flex items-center gap-1 rounded-full border font-medium {variants[variant]} {sizes[size]} {className}">
  {@render children()}
</span>

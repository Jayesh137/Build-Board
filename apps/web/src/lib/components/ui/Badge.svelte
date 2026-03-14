<script lang="ts">
  interface Props {
    variant?: 'done' | 'in_progress' | 'not_started' | 'blocked' | 'overdue' | 'info' | 'warning' | 'critical';
    size?: 'sm' | 'md';
    class?: string;
    children: import('svelte').Snippet;
  }

  let { variant = 'not_started', size = 'sm', class: className = '', children }: Props = $props();

  const variants: Record<string, string> = {
    done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    not_started: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    overdue: 'bg-red-600 text-white dark:bg-red-700',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
</script>

<span class="inline-flex items-center gap-1 rounded-full font-medium {variants[variant]} {sizes[size]} {className}">
  {@render children()}
</span>

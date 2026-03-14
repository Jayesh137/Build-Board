<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    padding?: 'compact' | 'default' | 'spacious';
    interactive?: boolean;
    children: Snippet;
  }

  let { padding = 'default', interactive = false, children, class: className = '', ...rest }: Props = $props();

  const paddings = {
    compact: 'p-3',
    default: 'p-4 lg:p-6',
    spacious: 'p-6 lg:p-8'
  };
</script>

<div
  class="rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 {paddings[padding]} {interactive ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors' : ''} {className}"
  {...rest}
>
  {@render children()}
</div>

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
  class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-none {paddings[padding]} {interactive ? 'cursor-pointer hover:shadow-md hover:translate-y-[-1px] dark:hover:bg-zinc-800/80 transition-all duration-200 ease-out' : ''} {className}"
  {...rest}
>
  {@render children()}
</div>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    label?: string;
    error?: string;
  }

  let { label, error, class: className = '', id, ...rest }: Props = $props();

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1">
  {#if label}
    <label for={inputId} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {label}
    </label>
  {/if}
  <input
    id={inputId}
    class="block w-full rounded-md border border-zinc-200 bg-white px-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 {className}"
    {...rest}
  />
  {#if error}
    <p class="text-xs text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>

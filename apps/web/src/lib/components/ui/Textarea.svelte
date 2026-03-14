<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    label?: string;
    error?: string;
  }

  let { label, error, class: className = '', id, value = $bindable(''), ...rest }: Props = $props();

  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1">
  {#if label}
    <label for={textareaId} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {label}
    </label>
  {/if}
  <textarea
    id={textareaId}
    bind:value
    class="block w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 {className}"
    {...rest}
  ></textarea>
  {#if error}
    <p class="text-xs text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>

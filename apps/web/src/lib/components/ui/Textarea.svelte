<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    label?: string;
    error?: string;
  }

  let { label, error, class: className = '', id, value = $bindable(''), ...rest }: Props = $props();

  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1.5">
  {#if label}
    <label for={textareaId} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {label}
    </label>
  {/if}
  <textarea
    id={textareaId}
    bind:value
    class="block w-full min-h-[100px] rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-[border-color,box-shadow] duration-150 ease-in-out focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-accent-400 {error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''} {className}"
    {...rest}
  ></textarea>
  {#if error}
    <p class="text-xs text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>

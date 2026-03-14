<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  interface Props extends HTMLSelectAttributes {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
  }

  let { label, error, options, class: className = '', id, value = $bindable(''), ...rest }: Props = $props();

  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="space-y-1">
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {label}
    </label>
  {/if}
  <select
    id={selectId}
    bind:value
    class="block w-full rounded-md border border-zinc-200 bg-white px-3 h-10 text-sm text-zinc-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 {className}"
    {...rest}
  >
    <option value="">Select...</option>
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  {#if error}
    <p class="text-xs text-red-600 dark:text-red-400">{error}</p>
  {/if}
</div>

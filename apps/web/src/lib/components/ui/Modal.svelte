<script lang="ts">
  import X from 'lucide-svelte/icons/x';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    onclose?: () => void;
    children: Snippet;
  }

  let { open = $bindable(), title, onclose, children }: Props = $props();

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-label={title}
    onkeydown={handleKeydown}
    onclick={handleBackdropClick}
  >
    <div class="w-full max-w-lg rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {#if title}
        <div class="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
          <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onclick={handleClose}
            class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>
      {/if}
      <div class="p-6">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

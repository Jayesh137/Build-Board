<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';

  interface Photo {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    room: string | null;
    phase: string | null;
    trade: string | null;
    type: string | null;
    date: string;
    createdAt: string;
  }

  interface Props {
    photos: Photo[];
    onphotoclick?: (photo: Photo) => void;
  }

  let { photos, onphotoclick }: Props = $props();

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
</script>

<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  {#each photos as photo}
    <button
      class="group relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 text-left transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
      onclick={() => onphotoclick?.(photo)}
    >
      <div class="aspect-square">
        <img
          src={photo.thumbnailUrl || photo.url}
          alt={photo.caption || 'Site photo'}
          class="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <div class="flex items-center justify-between gap-1">
          {#if photo.room}
            <span class="truncate rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {photo.room}
            </span>
          {/if}
          <span class="flex-shrink-0 text-[10px] text-white/80">{formatDate(photo.date)}</span>
        </div>
      </div>
    </button>
  {/each}
</div>

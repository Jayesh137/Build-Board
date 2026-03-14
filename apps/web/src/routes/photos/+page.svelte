<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import Upload from 'lucide-svelte/icons/upload';
  import Camera from 'lucide-svelte/icons/camera';
  import X from 'lucide-svelte/icons/x';
  import Grid3x3 from 'lucide-svelte/icons/grid-3x3';
  import Clock from 'lucide-svelte/icons/clock';
  import Compass from 'lucide-svelte/icons/compass';
  import XIcon from 'lucide-svelte/icons/x';

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

  interface Filters {
    rooms: string[];
    phases: string[];
    trades: string[];
    types: string[];
  }

  let { data, form } = $props();

  const photos: Photo[] = data.photos ?? [];
  const filters: Filters = data.filters ?? { rooms: [], phases: [], trades: [], types: [] };

  let showUploadModal = $state(false);
  let showDetailModal = $state(false);
  let selectedPhoto = $state<Photo | null>(null);
  let viewMode = $state<'grid' | 'timeline'>('grid');

  // Feature A: "What's Next" dismissable
  let whatsNextDismissed = $state(false);

  let filterRoom = $state($page.url.searchParams.get('room') || '');
  let filterPhase = $state($page.url.searchParams.get('phase') || '');
  let filterTrade = $state($page.url.searchParams.get('trade') || '');
  let filterType = $state($page.url.searchParams.get('type') || '');

  const roomOptions = [{ value: '', label: 'All rooms' }, ...filters.rooms.map((r) => ({ value: r, label: r }))];
  const phaseOptions = [{ value: '', label: 'All phases' }, ...filters.phases.map((p) => ({ value: p, label: p }))];
  const tradeOptions = [{ value: '', label: 'All trades' }, ...filters.trades.map((t) => ({ value: t, label: t }))];
  const typeOptions = [{ value: '', label: 'All types' }, ...filters.types.map((t) => ({ value: t, label: t }))];

  const uploadRoomOptions = [{ value: '', label: 'Select room...' }, ...filters.rooms.map((r) => ({ value: r, label: r }))];
  const uploadPhaseOptions = [{ value: '', label: 'Select phase...' }, ...filters.phases.map((p) => ({ value: p, label: p }))];
  const uploadTypeOptions = [
    { value: '', label: 'Select type...' },
    { value: 'Progress', label: 'Progress' },
    { value: 'Concealed Works', label: 'Concealed Works' },
    { value: 'Issue', label: 'Issue' },
    { value: 'Completion', label: 'Completion' },
    { value: 'Before', label: 'Before' },
    { value: 'After', label: 'After' },
    { value: 'Other', label: 'Other' },
  ];

  function applyFilters() {
    const params = new URLSearchParams();
    if (filterRoom) params.set('room', filterRoom);
    if (filterPhase) params.set('phase', filterPhase);
    if (filterTrade) params.set('trade', filterTrade);
    if (filterType) params.set('type', filterType);
    const qs = params.toString();
    goto(`/photos${qs ? `?${qs}` : ''}`, { invalidateAll: true });
  }

  function clearFilters() {
    filterRoom = '';
    filterPhase = '';
    filterTrade = '';
    filterType = '';
    goto('/photos', { invalidateAll: true });
  }

  const hasActiveFilters = $derived(filterRoom || filterPhase || filterTrade || filterType);

  function handlePhotoClick(photo: Photo) {
    selectedPhoto = photo;
    showDetailModal = true;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  // Timeline grouping: group photos by month, then by date within each month
  interface TimelineDay {
    dateKey: string;
    dateLabel: string;
    photos: Photo[];
    tags: string[];
  }

  interface TimelineMonth {
    monthKey: string;
    monthLabel: string;
    days: TimelineDay[];
  }

  const timelineData = $derived.by(() => {
    if (photos.length === 0) return [];

    // Sort photos newest first
    const sorted = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const monthMap = new Map<string, Map<string, Photo[]>>();

    for (const photo of sorted) {
      const d = new Date(photo.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) monthMap.set(monthKey, new Map());
      const dayMap = monthMap.get(monthKey)!;
      if (!dayMap.has(dateKey)) dayMap.set(dateKey, []);
      dayMap.get(dateKey)!.push(photo);
    }

    const result: TimelineMonth[] = [];

    for (const [monthKey, dayMap] of monthMap) {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      const monthLabel = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

      const days: TimelineDay[] = [];

      for (const [dateKey, dayPhotos] of dayMap) {
        const d = new Date(dateKey);
        const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        // Collect unique tags from this day's photos
        const tagSet = new Set<string>();
        for (const p of dayPhotos) {
          if (p.phase) tagSet.add(p.phase);
          if (p.room) tagSet.add(p.room);
        }

        days.push({
          dateKey,
          dateLabel,
          photos: dayPhotos,
          tags: [...tagSet],
        });
      }

      result.push({ monthKey, monthLabel, days });
    }

    return result;
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Photos</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <!-- View toggle -->
      <div class="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
        <button
          onclick={() => (viewMode = 'grid')}
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}"
          aria-label="Grid view"
        >
          <Grid3x3 size={14} />
          Grid
        </button>
        <button
          onclick={() => (viewMode = 'timeline')}
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {viewMode === 'timeline' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}"
          aria-label="Timeline view"
        >
          <Clock size={14} />
          Timeline
        </button>
      </div>

      <Button onclick={() => (showUploadModal = true)} size="sm">
        <Upload size={16} />
        Upload
      </Button>
    </div>
  </div>

  <!-- Feature A: What's Next prompt -->
  {#if !whatsNextDismissed}
    <div class="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 py-3 px-4">
      <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60">
        <Compass size={14} class="text-zinc-500 dark:text-zinc-400" />
      </div>
      <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Photograph concealed works (pipes, wires, insulation) BEFORE they're covered. You'll never be able to see them again.
      </p>
      <button
        onclick={() => (whatsNextDismissed = true)}
        class="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <XIcon size={14} />
      </button>
    </div>
  {/if}

  <!-- Filters -->
  <Card padding="compact">
    <div class="flex flex-wrap items-end gap-3 px-3 py-2">
      <div class="w-36">
        <Select label="Room" options={roomOptions} bind:value={filterRoom} onchange={applyFilters} />
      </div>
      <div class="w-36">
        <Select label="Phase" options={phaseOptions} bind:value={filterPhase} onchange={applyFilters} />
      </div>
      <div class="w-36">
        <Select label="Trade" options={tradeOptions} bind:value={filterTrade} onchange={applyFilters} />
      </div>
      <div class="w-36">
        <Select label="Type" options={typeOptions} bind:value={filterType} onchange={applyFilters} />
      </div>
      {#if hasActiveFilters}
        <button
          onclick={clearFilters}
          class="mb-0.5 inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <X size={12} />
          Clear
        </button>
      {/if}
    </div>
  </Card>

  <!-- Content -->
  {#if photos.length === 0}
    <!-- Empty state changes based on view mode -->
    {#if viewMode === 'timeline'}
      <Card>
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Camera size={28} class="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="text-base font-medium text-zinc-700 dark:text-zinc-300">
            {hasActiveFilters ? 'No photos match your filters' : 'Your build story starts here'}
          </p>
          {#if !hasActiveFilters}
            <p class="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Every photo you take becomes part of your build's visual timeline
            </p>
            <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Start by photographing your site as it is today
            </p>
          {:else}
            <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Try adjusting your filters</p>
          {/if}
          {#if !hasActiveFilters}
            <div class="mt-5">
              <Button size="sm" onclick={() => (showUploadModal = true)}>
                <Upload size={14} />
                Upload Photo
              </Button>
            </div>
          {/if}
        </div>
      </Card>
    {:else}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Camera size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {hasActiveFilters ? 'No photos match your filters' : 'No photos yet'}
          </p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Upload photos from your build site'}
          </p>
          {#if !hasActiveFilters}
            <div class="mt-4">
              <Button size="sm" onclick={() => (showUploadModal = true)}>
                <Upload size={14} />
                Upload Photo
              </Button>
            </div>
          {/if}
        </div>
      </Card>
    {/if}
  {:else if viewMode === 'grid'}
    <!-- Improved grid view -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {#each photos as photo}
        <button
          class="photo-card group relative overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 ring-zinc-200/60 transition-all duration-200 hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700/60 dark:hover:ring-zinc-600"
          onclick={() => handlePhotoClick(photo)}
        >
          <div class="aspect-square overflow-hidden">
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.caption || 'Site photo'}
              class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
          <div class="space-y-1.5 p-2.5">
            {#if photo.caption}
              <p class="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{photo.caption}</p>
            {/if}
            <div class="flex flex-wrap gap-1">
              {#if photo.room}
                <span class="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 ring-1 ring-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/30">
                  {photo.room}
                </span>
              {/if}
              {#if photo.phase}
                <span class="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 ring-1 ring-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/30">
                  {photo.phase}
                </span>
              {/if}
              {#if photo.type}
                <span class="inline-flex items-center rounded-full bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-200/50 dark:bg-zinc-700/30 dark:text-zinc-400 dark:ring-zinc-600/30">
                  {photo.type}
                </span>
              {/if}
            </div>
            <p class="text-[10px] text-zinc-400 dark:text-zinc-500">{formatDate(photo.date)}</p>
          </div>
        </button>
      {/each}
    </div>
  {:else}
    <!-- Timeline view -->
    <div class="space-y-8">
      {#each timelineData as month}
        <!-- Month header -->
        <div>
          <h3 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{month.monthLabel}</h3>
          <div class="relative ml-3 border-l-2 border-zinc-200 pl-6 dark:border-zinc-700">
            {#each month.days as day, dayIdx}
              <div class="relative pb-8 last:pb-0">
                <!-- Date pill on the line -->
                <div class="absolute -left-[calc(1.5rem+1px)] top-0 flex h-6 w-6 items-center justify-center">
                  <div class="h-2.5 w-2.5 rounded-full bg-zinc-300 ring-4 ring-white dark:bg-zinc-600 dark:ring-zinc-900"></div>
                </div>

                <!-- Date label -->
                <div class="mb-2">
                  <span class="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {day.dateLabel}
                  </span>
                </div>

                <!-- Photo thumbnails row -->
                <div class="mb-2 flex flex-wrap gap-2">
                  {#each day.photos as photo}
                    <button
                      class="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-zinc-200/60 transition-all duration-200 hover:shadow-md hover:ring-zinc-300 dark:ring-zinc-700/60 dark:hover:ring-zinc-600"
                      onclick={() => handlePhotoClick(photo)}
                      aria-label={photo.caption || 'View photo'}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.caption || 'Site photo'}
                        class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                      />
                    </button>
                  {/each}
                </div>

                <!-- Tags -->
                {#if day.tags.length > 0}
                  <div class="flex flex-wrap gap-1">
                    {#each day.tags as tag}
                      <span class="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:ring-zinc-700/30">
                        {tag}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Upload Modal -->
<Modal bind:open={showUploadModal} title="Upload Photo">
  <form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance class="space-y-4">
    <FileUpload name="file" accept=".jpg,.jpeg,.png,.heic,.webp" maxSizeMb={10} />

    <Input label="Caption" name="caption" placeholder="Describe this photo..." />

    <div class="grid gap-4 sm:grid-cols-2">
      <Select label="Room" name="room" options={uploadRoomOptions} />
      <Select label="Phase" name="phase" options={uploadPhaseOptions} />
    </div>

    <Select label="Type" name="type" options={uploadTypeOptions} />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showUploadModal = false)}>Cancel</Button>
      <Button type="submit">Upload</Button>
    </div>
  </form>
</Modal>

<!-- Photo Detail Modal -->
{#if selectedPhoto}
  <Modal bind:open={showDetailModal} title={selectedPhoto.caption || 'Photo'}>
    <div class="space-y-4">
      <div class="overflow-hidden rounded-lg">
        <img
          src={selectedPhoto.url}
          alt={selectedPhoto.caption || 'Site photo'}
          class="w-full"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        {#if selectedPhoto.room}
          <Badge variant="info" size="sm">{selectedPhoto.room}</Badge>
        {/if}
        {#if selectedPhoto.phase}
          <Badge variant="not_started" size="sm">{selectedPhoto.phase}</Badge>
        {/if}
        {#if selectedPhoto.type}
          <Badge variant="in_progress" size="sm">{selectedPhoto.type}</Badge>
        {/if}
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        {new Date(selectedPhoto.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  </Modal>
{/if}

<style>
  .photo-card {
    will-change: transform, box-shadow;
  }
</style>

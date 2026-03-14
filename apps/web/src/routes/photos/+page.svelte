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
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';
  import Upload from 'lucide-svelte/icons/upload';
  import Camera from 'lucide-svelte/icons/camera';
  import X from 'lucide-svelte/icons/x';

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
    <Button onclick={() => (showUploadModal = true)} size="sm">
      <Upload size={16} />
      Upload
    </Button>
  </div>

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

  <!-- Photo grid -->
  {#if photos.length === 0}
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
  {:else}
    <PhotoGrid {photos} onphotoclick={handlePhotoClick} />
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
      <div class="overflow-hidden rounded-md">
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

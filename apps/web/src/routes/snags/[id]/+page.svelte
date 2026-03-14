<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Check from 'lucide-svelte/icons/check';
  import CheckCheck from 'lucide-svelte/icons/check-check';
  import Camera from 'lucide-svelte/icons/camera';
  import Circle from 'lucide-svelte/icons/circle';
  import Wrench from 'lucide-svelte/icons/wrench';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';

  interface Snag {
    id: string;
    title: string;
    room: string | null;
    severity: 'critical' | 'major' | 'minor';
    status: 'open' | 'assigned' | 'in_progress' | 'fixed' | 'verified';
    contractor: string | null;
    description: string | null;
    resolutionNotes: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface Photo {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    type: 'issue' | 'resolution' | null;
    createdAt: string;
  }

  interface TimelineEvent {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: string | null;
  }

  let { data, form } = $props();

  const snag: Snag | null = data.snag;
  const photos: Photo[] = data.photos ?? [];
  const timeline: TimelineEvent[] = data.timeline ?? [];

  let showEditModal = $state(false);
  let showResolveModal = $state(false);

  function severityVariant(severity: string): 'critical' | 'warning' | 'not_started' {
    switch (severity) {
      case 'critical': return 'critical';
      case 'major': return 'warning';
      default: return 'not_started';
    }
  }

  function statusVariant(status: string): 'not_started' | 'info' | 'in_progress' | 'done' {
    switch (status) {
      case 'open': return 'not_started';
      case 'assigned': return 'info';
      case 'in_progress': return 'in_progress';
      case 'fixed': return 'done';
      case 'verified': return 'done';
      default: return 'not_started';
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'open': return 'Open';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'fixed': return 'Fixed';
      case 'verified': return 'Verified';
      default: return status;
    }
  }

  function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const issuePhotos = $derived(photos.filter((p) => p.type !== 'resolution'));
  const resolutionPhotos = $derived(photos.filter((p) => p.type === 'resolution'));

  const statusSteps = ['open', 'assigned', 'in_progress', 'fixed', 'verified'];

  function stepStatus(step: string, currentStatus: string): 'complete' | 'current' | 'pending' {
    const currentIdx = statusSteps.indexOf(currentStatus);
    const stepIdx = statusSteps.indexOf(step);
    if (stepIdx < currentIdx) return 'complete';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  }

  const roomOptions = [
    { value: '', label: 'Select room...' },
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'Bathroom', label: 'Bathroom' },
    { value: 'En-suite', label: 'En-suite' },
    { value: 'Living Room', label: 'Living Room' },
    { value: 'Bedroom 1', label: 'Bedroom 1' },
    { value: 'Bedroom 2', label: 'Bedroom 2' },
    { value: 'Bedroom 3', label: 'Bedroom 3' },
    { value: 'Hallway', label: 'Hallway' },
    { value: 'Landing', label: 'Landing' },
    { value: 'Garage', label: 'Garage' },
    { value: 'Utility', label: 'Utility' },
    { value: 'Garden', label: 'Garden' },
    { value: 'Exterior', label: 'Exterior' },
    { value: 'Other', label: 'Other' },
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
  ];

  const statusSelectOptions = [
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'verified', label: 'Verified' },
  ];
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/snags" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
    <ArrowLeft size={16} />
    Back to Snags
  </a>

  {#if !snag}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Snag not found</p>
      </div>
    </Card>
  {:else}
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{snag.title}</h1>
        <div class="flex items-center gap-2">
          <Badge variant={severityVariant(snag.severity)} size="sm">{snag.severity}</Badge>
          <Badge variant={statusVariant(snag.status)}>{statusLabel(snag.status)}</Badge>
          {#if snag.room}
            <span class="text-sm text-zinc-500 dark:text-zinc-400">{snag.room}</span>
          {/if}
        </div>
      </div>
      <Button variant="secondary" size="sm" onclick={() => (showEditModal = true)}>
        <Pencil size={14} />
        Edit
      </Button>
    </div>

    <!-- Status timeline -->
    <Card>
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Progress</h2>
      <div class="flex items-center justify-between">
        {#each statusSteps as step, i}
          {@const status = stepStatus(step, snag.status)}
          <div class="flex flex-col items-center gap-1.5">
            {#if status === 'complete'}
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check size={16} class="text-green-600 dark:text-green-400" />
              </div>
            {:else if status === 'current'}
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 ring-2 ring-accent-400 dark:bg-accent-900/30 dark:ring-accent-600">
                <Circle size={10} class="fill-accent-500 text-accent-500" />
              </div>
            {:else}
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Circle size={10} class="text-zinc-300 dark:text-zinc-600" />
              </div>
            {/if}
            <span class="text-[10px] font-medium {status === 'current' ? 'text-accent-600 dark:text-accent-400' : status === 'complete' ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'}">
              {statusLabel(step)}
            </span>
          </div>
          {#if i < statusSteps.length - 1}
            <div class="flex-1 px-1">
              <div class="h-0.5 w-full rounded-full {statusSteps.indexOf(snag.status) > i ? 'bg-green-400 dark:bg-green-600' : 'bg-zinc-200 dark:bg-zinc-700'}"></div>
            </div>
          {/if}
        {/each}
      </div>
    </Card>

    <!-- Details -->
    <div class="grid gap-4 sm:grid-cols-2">
      <Card>
        <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Details</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-zinc-500 dark:text-zinc-400">Contractor</dt>
            <dd class="text-zinc-900 dark:text-zinc-100">{snag.contractor || '--'}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-zinc-500 dark:text-zinc-400">Created</dt>
            <dd class="text-zinc-900 dark:text-zinc-100">{formatDate(snag.createdAt)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-zinc-500 dark:text-zinc-400">Updated</dt>
            <dd class="text-zinc-900 dark:text-zinc-100">{formatDate(snag.updatedAt)}</dd>
          </div>
        </dl>
      </Card>
      {#if snag.description}
        <Card>
          <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Description</h2>
          <p class="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{snag.description}</p>
        </Card>
      {/if}
    </div>

    <!-- Issue photos -->
    <div>
      <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Issue Photos ({issuePhotos.length})</h2>
      {#if issuePhotos.length === 0}
        <Card>
          <div class="flex flex-col items-center justify-center py-6 text-center">
            <Camera size={20} class="mb-1.5 text-zinc-300 dark:text-zinc-600" />
            <p class="text-xs text-zinc-500 dark:text-zinc-400">No photos attached</p>
          </div>
        </Card>
      {:else}
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {#each issuePhotos as photo}
            <a href={photo.url} target="_blank" rel="noopener noreferrer" class="group">
              <div class="aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || 'Snag photo'}
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Resolution workflow -->
    {#if snag.status === 'in_progress' || snag.status === 'assigned' || snag.status === 'open'}
      <Card class="border-amber-200 dark:border-amber-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
            <Wrench size={20} class="text-amber-600 dark:text-amber-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Ready to resolve?</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Add resolution notes and mark as fixed</p>
          </div>
          <Button size="sm" onclick={() => (showResolveModal = true)}>
            <Check size={14} />
            Mark Fixed
          </Button>
        </div>
      </Card>
    {/if}

    {#if snag.status === 'fixed'}
      <Card class="border-green-200 dark:border-green-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
            <CheckCheck size={20} class="text-green-600 dark:text-green-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Fix reported</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Verify the fix is satisfactory</p>
          </div>
          <form method="POST" action="?/verify" use:enhance>
            <Button size="sm" type="submit">
              <CheckCheck size={14} />
              Verify Fix
            </Button>
          </form>
        </div>
      </Card>
    {/if}

    <!-- Resolution notes and photos -->
    {#if snag.resolutionNotes}
      <Card>
        <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resolution Notes</h2>
        <p class="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{snag.resolutionNotes}</p>
      </Card>
    {/if}

    {#if resolutionPhotos.length > 0}
      <div>
        <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resolution Photos</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {#each resolutionPhotos as photo}
            <a href={photo.url} target="_blank" rel="noopener noreferrer" class="group">
              <div class="aspect-square overflow-hidden rounded-md border border-green-200 bg-zinc-100 dark:border-green-800 dark:bg-zinc-800">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || 'Resolution photo'}
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Timeline -->
    {#if timeline.length > 0}
      <Card>
        <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity</h2>
        <div class="space-y-3">
          {#each timeline as event}
            <div class="flex gap-3">
              <div class="flex flex-col items-center">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Circle size={6} class="fill-zinc-400 text-zinc-400" />
                </div>
                <div class="flex-1 border-l border-zinc-200 dark:border-zinc-700"></div>
              </div>
              <div class="pb-3">
                <p class="text-sm text-zinc-900 dark:text-zinc-100">{event.description}</p>
                <p class="text-xs text-zinc-400">{formatDateTime(event.createdAt)}</p>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
  {/if}
</div>

<!-- Mark Fixed Modal -->
<Modal bind:open={showResolveModal} title="Mark as Fixed">
  <form method="POST" action="?/markFixed" enctype="multipart/form-data" use:enhance class="space-y-4">
    <Textarea label="Resolution Notes" name="resolutionNotes" placeholder="How was this resolved?" rows={3} />

    <div>
      <p class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Resolution Photo</p>
      <FileUpload name="resolutionPhoto" accept=".jpg,.jpeg,.png,.heic,.webp" maxSizeMb={10} />
    </div>

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showResolveModal = false)}>Cancel</Button>
      <Button type="submit">
        <Check size={14} />
        Mark as Fixed
      </Button>
    </div>
  </form>
</Modal>

<!-- Edit Snag Modal -->
{#if snag}
  <Modal bind:open={showEditModal} title="Edit Snag">
    <form method="POST" action="?/update" use:enhance class="space-y-4">
      <Input label="Title" name="title" value={snag.title} required />
      <Select label="Room" name="room" options={roomOptions} value={snag.room ?? ''} />
      <Select label="Severity" name="severity" options={severityOptions} value={snag.severity} />
      <Select label="Status" name="status" options={statusSelectOptions} value={snag.status} />
      <Input label="Contractor" name="contractor" value={snag.contractor ?? ''} placeholder="Assigned contractor" />
      <Textarea label="Description" name="description" value={snag.description ?? ''} rows={3} />

      {#if form?.error}
        <p class="text-sm text-red-600">{form.error}</p>
      {/if}

      <div class="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onclick={() => (showEditModal = false)}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  </Modal>
{/if}

<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import {
    Plus,
    AlertTriangle,
    List,
    Columns3,
    Share2,
    Copy,
    Check,
    ChevronRight,
  } from 'lucide-svelte';

  interface Snag {
    id: string;
    title: string;
    room: string | null;
    severity: 'critical' | 'major' | 'minor';
    status: 'open' | 'assigned' | 'in_progress' | 'fixed' | 'verified';
    contractor: string | null;
    description: string | null;
    createdAt: string;
  }

  interface Stats {
    total: number;
    open: number;
    inProgress: number;
    fixed: number;
    verified: number;
  }

  let { data, form } = $props();

  const snags: Snag[] = data.snags ?? [];
  const stats: Stats | null = data.stats;
  const shareToken: string | null = data.shareToken;

  let showAddModal = $state(false);
  let viewMode = $state<'list' | 'kanban'>('list');
  let filterRoom = $state('all');
  let filterSeverity = $state('all');
  let filterStatus = $state('all');
  let filterContractor = $state('all');
  let copied = $state(false);

  const severityOptions = [
    { value: 'all', label: 'All severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'verified', label: 'Verified' },
  ];

  const rooms = $derived(() => {
    const set = new Set(snags.map((s) => s.room).filter(Boolean) as string[]);
    return [{ value: 'all', label: 'All rooms' }, ...Array.from(set).sort().map((r) => ({ value: r, label: r }))];
  });

  const contractors = $derived(() => {
    const set = new Set(snags.map((s) => s.contractor).filter(Boolean) as string[]);
    return [{ value: 'all', label: 'All contractors' }, ...Array.from(set).sort().map((c) => ({ value: c, label: c }))];
  });

  const roomSelectOptions = [
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

  const filteredSnags = $derived(
    snags
      .filter((s) => filterRoom === 'all' || s.room === filterRoom)
      .filter((s) => filterSeverity === 'all' || s.severity === filterSeverity)
      .filter((s) => filterStatus === 'all' || s.status === filterStatus)
      .filter((s) => filterContractor === 'all' || s.contractor === filterContractor)
  );

  // Kanban columns
  const kanbanColumns = [
    { key: 'open', label: 'Open', variant: 'not_started' as const },
    { key: 'assigned', label: 'Assigned', variant: 'info' as const },
    { key: 'in_progress', label: 'In Progress', variant: 'in_progress' as const },
    { key: 'fixed', label: 'Fixed', variant: 'done' as const },
    { key: 'verified', label: 'Verified', variant: 'done' as const },
  ];

  function snagsByStatus(status: string): Snag[] {
    return filteredSnags.filter((s) => s.status === status);
  }

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

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/snags/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  let selectedSeverity = $state('minor');
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Snag List</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Track and resolve defects
      </p>
    </div>
    <div class="flex items-center gap-2">
      {#if shareToken}
        <Button variant="secondary" size="sm" onclick={copyShareLink}>
          {#if copied}
            <Check size={14} />
            Copied
          {:else}
            <Share2 size={14} />
            Share
          {/if}
        </Button>
      {/if}
      <Button onclick={() => (showAddModal = true)} size="sm">
        <Plus size={16} />
        Add Snag
      </Button>
    </div>
  </div>

  <!-- Stats bar -->
  {#if stats}
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Card padding="compact">
        <div class="px-2 py-1.5 text-center">
          <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{stats.total}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
        </div>
      </Card>
      <Card padding="compact">
        <div class="px-2 py-1.5 text-center">
          <p class="text-lg font-semibold text-red-600 dark:text-red-400">{stats.open}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Open</p>
        </div>
      </Card>
      <Card padding="compact">
        <div class="px-2 py-1.5 text-center">
          <p class="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.inProgress}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">In Progress</p>
        </div>
      </Card>
      <Card padding="compact">
        <div class="px-2 py-1.5 text-center">
          <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.fixed}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Fixed</p>
        </div>
      </Card>
      <Card padding="compact">
        <div class="px-2 py-1.5 text-center">
          <p class="text-lg font-semibold text-green-600 dark:text-green-400">{stats.verified}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Verified</p>
        </div>
      </Card>
    </div>
  {/if}

  <!-- View toggle and filters -->
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex rounded-md border border-zinc-200 dark:border-zinc-700">
      <button
        onclick={() => (viewMode = 'list')}
        class="flex items-center gap-1.5 rounded-l-md px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'list'
          ? 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400'
          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}"
      >
        <List size={14} />
        List
      </button>
      <button
        onclick={() => (viewMode = 'kanban')}
        class="flex items-center gap-1.5 rounded-r-md border-l border-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors dark:border-zinc-700 {viewMode === 'kanban'
          ? 'bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-400'
          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}"
      >
        <Columns3 size={14} />
        Board
      </button>
    </div>

    <div class="w-32">
      <Select options={rooms()} bind:value={filterRoom} />
    </div>
    <div class="w-32">
      <Select options={severityOptions} bind:value={filterSeverity} />
    </div>
    <div class="w-32">
      <Select options={statusOptions} bind:value={filterStatus} />
    </div>
    <div class="w-36">
      <Select options={contractors()} bind:value={filterContractor} />
    </div>
  </div>

  <!-- Share link info -->
  {#if shareToken}
    <div class="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <Share2 size={12} />
      <span>Contractors can view assigned snags via the shared link</span>
    </div>
  {/if}

  <!-- Content -->
  {#if filteredSnags.length === 0 && snags.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No snags recorded yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Track defects and issues found during your build</p>
      </div>
    </Card>
  {:else if filteredSnags.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-8 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No snags match your filters</p>
      </div>
    </Card>
  {:else if viewMode === 'list'}
    <!-- List view -->
    <Card padding="compact">
      <!-- Table header -->
      <div class="hidden border-b border-zinc-200 px-3 py-2 sm:grid sm:grid-cols-12 sm:gap-3 dark:border-zinc-800">
        <p class="col-span-4 text-xs font-medium text-zinc-400">Title</p>
        <p class="col-span-2 text-xs font-medium text-zinc-400">Room</p>
        <p class="col-span-1 text-xs font-medium text-zinc-400">Severity</p>
        <p class="col-span-2 text-xs font-medium text-zinc-400">Status</p>
        <p class="col-span-2 text-xs font-medium text-zinc-400">Contractor</p>
        <p class="col-span-1 text-xs font-medium text-zinc-400">Date</p>
      </div>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        {#each filteredSnags as snag}
          <a
            href="/snags/{snag.id}"
            class="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:grid sm:grid-cols-12"
          >
            <div class="min-w-0 flex-1 sm:col-span-4">
              <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{snag.title}</p>
            </div>
            <div class="hidden sm:col-span-2 sm:block">
              <p class="text-sm text-zinc-500 dark:text-zinc-400">{snag.room || '--'}</p>
            </div>
            <div class="sm:col-span-1">
              <Badge variant={severityVariant(snag.severity)} size="sm">
                {snag.severity}
              </Badge>
            </div>
            <div class="sm:col-span-2">
              <Badge variant={statusVariant(snag.status)} size="sm">
                {statusLabel(snag.status)}
              </Badge>
            </div>
            <div class="hidden sm:col-span-2 sm:block">
              <p class="truncate text-sm text-zinc-500 dark:text-zinc-400">{snag.contractor || '--'}</p>
            </div>
            <div class="hidden sm:col-span-1 sm:flex sm:items-center sm:justify-between">
              <p class="text-xs text-zinc-400">{formatDate(snag.createdAt)}</p>
              <ChevronRight size={14} class="text-zinc-300 dark:text-zinc-600" />
            </div>
          </a>
        {/each}
      </div>
    </Card>
  {:else}
    <!-- Kanban view -->
    <div class="flex gap-4 overflow-x-auto pb-4">
      {#each kanbanColumns as column}
        {@const columnSnags = snagsByStatus(column.key)}
        <div class="w-64 flex-shrink-0">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Badge variant={column.variant} size="sm">{column.label}</Badge>
              <span class="text-xs text-zinc-400">{columnSnags.length}</span>
            </div>
          </div>
          <div class="space-y-2">
            {#each columnSnags as snag}
              <a href="/snags/{snag.id}">
                <Card interactive padding="compact">
                  <div class="space-y-2 p-1">
                    <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{snag.title}</p>
                    <div class="flex items-center gap-2">
                      <Badge variant={severityVariant(snag.severity)} size="sm">
                        {snag.severity}
                      </Badge>
                      {#if snag.room}
                        <span class="text-xs text-zinc-500 dark:text-zinc-400">{snag.room}</span>
                      {/if}
                    </div>
                    {#if snag.contractor}
                      <p class="text-xs text-zinc-500 dark:text-zinc-400">{snag.contractor}</p>
                    {/if}
                  </div>
                </Card>
              </a>
            {/each}
            {#if columnSnags.length === 0}
              <div class="rounded-md border border-dashed border-zinc-200 px-3 py-6 text-center dark:border-zinc-700">
                <p class="text-xs text-zinc-400">No snags</p>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Quick-Add Snag Modal -->
<Modal bind:open={showAddModal} title="Add Snag">
  <form method="POST" action="?/create" use:enhance class="space-y-4">
    <Input label="Title" name="title" required placeholder="e.g. Cracked tile in bathroom" />

    <Select label="Room" name="room" options={roomSelectOptions} />

    <div>
      <p class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Severity</p>
      <div class="flex gap-2">
        {#each ['critical', 'major', 'minor'] as sev}
          {@const colors = {
            critical: selectedSeverity === 'critical' ? 'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-400' : 'border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-400',
            major: selectedSeverity === 'major' ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'border-zinc-200 text-zinc-600 hover:border-amber-300 dark:border-zinc-700 dark:text-zinc-400',
            minor: selectedSeverity === 'minor' ? 'border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-300' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400',
          }}
          <button
            type="button"
            onclick={() => (selectedSeverity = sev)}
            class="flex-1 rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors {colors[sev as keyof typeof colors]}"
          >
            {sev}
          </button>
        {/each}
      </div>
      <input type="hidden" name="severity" value={selectedSeverity} />
    </div>

    <Textarea label="Description" name="description" placeholder="What's wrong?" rows={2} />

    <Input label="Contractor" name="contractor" placeholder="Who should fix this?" />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showAddModal = false)}>Cancel</Button>
      <Button type="submit">Add Snag</Button>
    </div>
  </form>
</Modal>

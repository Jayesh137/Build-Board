<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import List from 'lucide-svelte/icons/list';
  import Columns3 from 'lucide-svelte/icons/columns-3';
  import Share2 from 'lucide-svelte/icons/share-2';
  import Copy from 'lucide-svelte/icons/copy';
  import Check from 'lucide-svelte/icons/check';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import CircleAlert from 'lucide-svelte/icons/circle-alert';
  import Clock from 'lucide-svelte/icons/clock';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import ShieldCheck from 'lucide-svelte/icons/shield-check';
  import Compass from 'lucide-svelte/icons/compass';
  import XIcon from 'lucide-svelte/icons/x';

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
  let copied = $state(false);

  // Feature A: "What's Next" dismissable
  let whatsNextDismissed = $state(false);

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
  );

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

  function severityBorder(severity: string): string {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'major': return 'border-l-amber-500';
      default: return 'border-l-zinc-300 dark:border-l-zinc-600';
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
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Snag List
        {#if stats}
          <span class="ml-2 align-middle text-base font-normal text-zinc-400 dark:text-zinc-500">
            {stats.total} total
          </span>
        {/if}
      </h1>
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
        Report Snag
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
        Spot a defect? Log it with a photo. The quicker you report snags, the sooner they get fixed.
      </p>
      <button
        onclick={() => (whatsNextDismissed = true)}
        class="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <XIcon size={14} />
      </button>
    </div>
  {/if}

  <!-- Stats bar -->
  {#if stats}
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] overflow-hidden">
        <div class="h-0.5 bg-red-500"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
            <CircleAlert size={18} class="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p class="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stats.open}</p>
            <p class="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Open</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] overflow-hidden">
        <div class="h-0.5 bg-amber-500"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
            <Clock size={18} class="text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stats.inProgress}</p>
            <p class="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">In Progress</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] overflow-hidden">
        <div class="h-0.5 bg-green-500"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
            <CircleCheck size={18} class="text-green-500 dark:text-green-400" />
          </div>
          <div>
            <p class="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stats.fixed}</p>
            <p class="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Fixed</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] overflow-hidden">
        <div class="h-0.5 bg-blue-500"></div>
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <ShieldCheck size={18} class="text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stats.verified}</p>
            <p class="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Verified</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- View toggle & filters -->
  <div class="flex flex-wrap items-center gap-3">
    <!-- View toggle pills -->
    <div class="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-800">
      <button
        onclick={() => (viewMode = 'list')}
        class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all {viewMode === 'list'
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}"
      >
        <List size={14} />
        List
      </button>
      <button
        onclick={() => (viewMode = 'kanban')}
        class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all {viewMode === 'kanban'
          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}"
      >
        <Columns3 size={14} />
        Board
      </button>
    </div>

    <div class="h-5 w-px bg-zinc-200 dark:bg-zinc-700"></div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <select
        bind:value={filterRoom}
        class="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {#each rooms() as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <select
        bind:value={filterSeverity}
        class="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {#each severityOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <select
        bind:value={filterStatus}
        class="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      >
        {#each statusOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Share link info -->
  {#if shareToken}
    <div class="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
      <Share2 size={12} />
      <span>Contractors can view assigned snags via the shared link</span>
    </div>
  {/if}

  <!-- Content -->
  {#if filteredSnags.length === 0 && snags.length === 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
          <CircleCheck size={28} class="text-green-400 dark:text-green-500" />
        </div>
        <p class="text-base font-medium text-zinc-700 dark:text-zinc-300">No snags yet — that's a good thing!</p>
        <p class="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Report defects and issues found during your build</p>
        <div class="mt-5">
          <Button size="sm" onclick={() => (showAddModal = true)}>
            <Plus size={16} />
            Report Snag
          </Button>
        </div>
      </div>
    </div>
  {:else if filteredSnags.length === 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center py-10 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No snags match your filters</p>
      </div>
    </div>
  {:else if viewMode === 'list'}
    <!-- List view -->
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <!-- Table header -->
      <div class="hidden border-b border-zinc-100 px-4 py-2.5 sm:grid sm:grid-cols-12 sm:gap-3 dark:border-zinc-800">
        <p class="col-span-5 text-xs font-semibold uppercase tracking-wider text-zinc-400">Title</p>
        <p class="col-span-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Room</p>
        <p class="col-span-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</p>
        <p class="col-span-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Severity</p>
        <p class="col-span-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</p>
      </div>

      <div class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {#each filteredSnags as snag}
          <a
            href="/snags/{snag.id}"
            class="group flex items-center gap-3 border-l-4 px-4 py-3.5 transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 sm:grid sm:grid-cols-12 {severityBorder(snag.severity)}"
          >
            <div class="min-w-0 flex-1 sm:col-span-5">
              <div class="flex items-center gap-2.5">
                <span class="h-2 w-2 flex-shrink-0 rounded-full {snag.severity === 'critical' ? 'bg-red-500' : snag.severity === 'major' ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'}"></span>
                <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{snag.title}</p>
              </div>
            </div>
            <div class="hidden sm:col-span-2 sm:block">
              {#if snag.room}
                <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {snag.room}
                </span>
              {:else}
                <span class="text-xs text-zinc-300 dark:text-zinc-600">--</span>
              {/if}
            </div>
            <div class="sm:col-span-2">
              <Badge variant={statusVariant(snag.status)} size="sm">
                {statusLabel(snag.status)}
              </Badge>
            </div>
            <div class="hidden sm:col-span-2 sm:block">
              <Badge variant={severityVariant(snag.severity)} size="sm">
                {snag.severity}
              </Badge>
            </div>
            <div class="hidden sm:col-span-1 sm:flex sm:items-center sm:justify-between">
              <p class="text-xs text-zinc-400">{formatDate(snag.createdAt)}</p>
              <ChevronRight size={14} class="text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
            </div>
          </a>
        {/each}
      </div>
    </div>
  {:else}
    <!-- Board / Kanban view -->
    <div class="flex gap-4 overflow-x-auto pb-4">
      {#each kanbanColumns as column}
        {@const columnSnags = snagsByStatus(column.key)}
        <div class="w-64 flex-shrink-0">
          <!-- Column header -->
          <div class="mb-3 flex items-center justify-between rounded-lg bg-zinc-50/80 px-3 py-2.5 dark:bg-zinc-800/40 border border-zinc-100/80 dark:border-zinc-800/60">
            <div class="flex items-center gap-2">
              <Badge variant={column.variant} size="sm">{column.label}</Badge>
            </div>
            <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-200/80 px-1.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {columnSnags.length}
            </span>
          </div>

          <!-- Column cards -->
          <div class="space-y-2">
            {#each columnSnags as snag}
              <a href="/snags/{snag.id}" class="block">
                <div class="rounded-xl border border-zinc-200/50 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_1px_4px_rgba(0,0,0,0.15)] dark:hover:border-zinc-700 dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{snag.title}</p>
                  <div class="mt-2.5 flex items-center gap-2">
                    <Badge variant={severityVariant(snag.severity)} size="sm">
                      {snag.severity}
                    </Badge>
                    {#if snag.room}
                      <span class="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {snag.room}
                      </span>
                    {/if}
                  </div>
                  {#if snag.contractor}
                    <p class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{snag.contractor}</p>
                  {/if}
                </div>
              </a>
            {/each}
            {#if columnSnags.length === 0}
              <div class="rounded-xl border-2 border-dashed border-zinc-200 px-3 py-8 text-center dark:border-zinc-800">
                <p class="text-xs text-zinc-400 dark:text-zinc-500">No snags</p>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Quick-Add Snag Modal -->
<Modal bind:open={showAddModal} title="Report Snag">
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
            class="flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors {colors[sev as keyof typeof colors]}"
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
      <Button type="submit">Report Snag</Button>
    </div>
  </form>
</Modal>

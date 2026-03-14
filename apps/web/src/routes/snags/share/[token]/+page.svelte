<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    AlertTriangle,
    Camera,
    ChevronDown,
    ChevronRight,
  } from 'lucide-svelte';

  interface SharedSnag {
    id: string;
    title: string;
    room: string | null;
    severity: 'critical' | 'major' | 'minor';
    status: 'open' | 'assigned' | 'in_progress' | 'fixed' | 'verified';
    description: string | null;
    photos: { url: string; thumbnailUrl: string | null; caption: string | null }[];
    createdAt: string;
  }

  interface Project {
    name: string;
    address: string | null;
  }

  let { data } = $props();

  const snags: SharedSnag[] = data.snags ?? [];
  const project: Project | null = data.project;
  const error: string | null = data.error;

  let expandedSnags = $state<Set<string>>(new Set());

  function toggleSnag(id: string) {
    const next = new Set(expandedSnags);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedSnags = next;
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
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const activeSnags = $derived(snags.filter((s) => s.status !== 'verified'));
</script>

<!-- Public page - no sidebar/nav layout -->
<div class="min-h-screen bg-zinc-50 dark:bg-zinc-950">
  <!-- Header bar -->
  <header class="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
      <div>
        <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">BuildTracker</p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">Snag List</p>
      </div>
      {#if project}
        <div class="text-right">
          <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.name}</p>
          {#if project.address}
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{project.address}</p>
          {/if}
        </div>
      {/if}
    </div>
  </header>

  <div class="mx-auto max-w-4xl px-4 py-6">
    {#if error}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
        </div>
      </Card>
    {:else if snags.length === 0}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No snags to display</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">All clear - nothing assigned</p>
        </div>
      </Card>
    {:else}
      <div class="space-y-4">
        <!-- Summary -->
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Assigned Snags ({activeSnags.length})
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            {snags.length} total
          </p>
        </div>

        <!-- Snag list -->
        {#each snags as snag}
          {@const isExpanded = expandedSnags.has(snag.id)}
          <Card padding="compact">
            <button
              class="flex w-full items-center gap-3 px-3 py-3 text-left"
              onclick={() => toggleSnag(snag.id)}
            >
              <div class="flex-shrink-0">
                {#if isExpanded}
                  <ChevronDown size={16} class="text-zinc-400" />
                {:else}
                  <ChevronRight size={16} class="text-zinc-400" />
                {/if}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{snag.title}</p>
                <div class="mt-1 flex items-center gap-2">
                  {#if snag.room}
                    <span class="text-xs text-zinc-500 dark:text-zinc-400">{snag.room}</span>
                  {/if}
                  <span class="text-xs text-zinc-400">{formatDate(snag.createdAt)}</span>
                </div>
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                <Badge variant={severityVariant(snag.severity)} size="sm">{snag.severity}</Badge>
                <Badge variant={statusVariant(snag.status)} size="sm">{statusLabel(snag.status)}</Badge>
                {#if snag.photos.length > 0}
                  <span class="flex items-center gap-0.5 text-xs text-zinc-400">
                    <Camera size={12} />
                    {snag.photos.length}
                  </span>
                {/if}
              </div>
            </button>

            {#if isExpanded}
              <div class="border-t border-zinc-200 px-3 py-3 dark:border-zinc-700">
                {#if snag.description}
                  <p class="mb-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{snag.description}</p>
                {/if}

                {#if snag.photos.length > 0}
                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {#each snag.photos as photo}
                      <a href={photo.url} target="_blank" rel="noopener noreferrer" class="group">
                        <div class="aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                          <img
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.caption || 'Snag photo'}
                            class="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      </a>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </Card>
        {/each}
      </div>

      <!-- Footer branding -->
      <div class="mt-8 border-t border-zinc-200 pt-4 text-center dark:border-zinc-800">
        <p class="text-xs text-zinc-400 dark:text-zinc-500">
          Powered by <span class="font-medium text-zinc-500 dark:text-zinc-400">BuildTracker</span>
        </p>
      </div>
    {/if}
  </div>
</div>

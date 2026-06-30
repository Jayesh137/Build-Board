<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import Wallet from 'lucide-svelte/icons/wallet';
  import Receipt from 'lucide-svelte/icons/receipt';
  import FileCheck from 'lucide-svelte/icons/file-check';
  import Users from 'lucide-svelte/icons/users';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import BookOpen from 'lucide-svelte/icons/book-open';
  import Camera from 'lucide-svelte/icons/camera';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import Settings from 'lucide-svelte/icons/settings';
  import Menu from 'lucide-svelte/icons/menu';
  import X from 'lucide-svelte/icons/x';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import MapPin from 'lucide-svelte/icons/map-pin';
  import { page } from '$app/stores';

  interface Props {
    data: import('./$types').LayoutServerData;
    children: Snippet;
  }

  let { data, children }: Props = $props();

  let sidebarOpen = $state(false);
  let sidebarCollapsed = $state(false);

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      label: 'Build',
      items: [
        { href: '/timeline', icon: CalendarDays, label: 'Timeline' },
        { href: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
      ],
    },
    {
      label: 'Money',
      items: [
        { href: '/budget', icon: Wallet, label: 'Budget' },
        { href: '/vat', icon: Receipt, label: 'VAT Reclaim' },
      ],
    },
    {
      label: 'Compliance',
      items: [
        { href: '/planning', icon: FileCheck, label: 'Planning & CIL' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { href: '/decisions', icon: GitBranch, label: 'Decisions' },
        { href: '/contacts', icon: Users, label: 'Contacts' },
      ],
    },
    {
      label: 'Site',
      items: [
        { href: '/diary', icon: BookOpen, label: 'Diary' },
        { href: '/photos', icon: Camera, label: 'Photos' },
        { href: '/snags', icon: AlertTriangle, label: 'Snags' },
      ],
    },
    {
      label: 'Files',
      items: [
        { href: '/documents', icon: FolderOpen, label: 'Documents' },
      ],
    },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const mobileTabs = [
    { href: '/', icon: LayoutDashboard, label: 'Home' },
    { href: '/timeline', icon: CalendarDays, label: 'Time' },
    { href: '/budget', icon: Wallet, label: 'Budget' },
    { href: '/diary', icon: BookOpen, label: 'Diary' },
    { href: '/settings', icon: Settings, label: 'More' },
  ];
</script>

<div class="flex h-full">
  <!-- Mobile sidebar backdrop -->
  {#if sidebarOpen}
    <button
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden transition-opacity duration-200 ease-out"
      onclick={() => (sidebarOpen = false)}
      aria-label="Close sidebar"
    ></button>
  {/if}

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200/80 bg-white transition-all duration-200 ease-out dark:border-zinc-800/60 dark:bg-zinc-950 lg:static {sidebarCollapsed ? 'w-16' : 'w-60'} {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
  >
    <!-- Header -->
    <div class="border-b border-zinc-200/80 px-4 pb-4 pt-5 dark:border-zinc-800/50">
      {#if !sidebarCollapsed}
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-accent-500 dark:text-accent-400">BuildBoard</p>
            <p class="mt-1.5 text-base font-bold text-zinc-900 dark:text-zinc-50">{data.projectName}</p>
            <div class="mt-1 flex items-center gap-1.5">
              <MapPin size={11} class="shrink-0 text-zinc-400 dark:text-zinc-500" />
              <p class="truncate text-xs text-zinc-500 dark:text-zinc-400">{data.projectAddress || 'Project address not set'}</p>
            </div>
          </div>
          <button
            onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
            class="hidden shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 lg:block"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={16} class="transition-transform duration-200" />
          </button>
          <button
            onclick={() => (sidebarOpen = false)}
            class="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mt-3.5">
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800/80">
            <div
              class="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400 transition-all duration-500 ease-out progress-glow"
              style="width: {data.progress}%"
            ></div>
          </div>
          <p class="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">{data.progress}% complete</p>
        </div>
      {:else}
        <div class="flex justify-center">
          <button
            onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
            class="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft size={16} class="rotate-180 transition-transform duration-200" />
          </button>
        </div>
      {/if}
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      {#each navGroups as group, groupIdx}
        {#if !sidebarCollapsed}
          <p class="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 {groupIdx === 0 ? 'mt-0' : 'mt-6'}">
            {group.label}
          </p>
        {:else}
          <div class="{groupIdx === 0 ? '' : 'my-3'} border-t border-zinc-100 dark:border-zinc-800 {groupIdx === 0 ? 'hidden' : ''}"></div>
        {/if}
        {#each group.items as item}
          {@const active = isActive(item.href, $page.url.pathname)}
          <a
            href={item.href}
            class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ease-out
              {active
                ? 'border-l-[3px] border-accent-500 bg-accent-50/60 pl-[9px] font-semibold text-accent-700 dark:bg-accent-950/40 dark:text-accent-400'
                : 'border-l-[3px] border-transparent pl-[9px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'}"
            onclick={() => (sidebarOpen = false)}
          >
            <item.icon size={18} class="shrink-0" />
            {#if !sidebarCollapsed}
              <span class="truncate">{item.label}</span>
            {/if}
          </a>
        {/each}
      {/each}
    </nav>

    <!-- Footer -->
    <div class="border-t border-zinc-200/80 px-2 py-3 dark:border-zinc-800/50">
      <a
        href="/settings"
        class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-all duration-150 ease-out hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
      >
        <Settings size={18} />
        {#if !sidebarCollapsed}
          <span class="flex-1">Settings</span>
          <span class="text-[9px] text-zinc-300 dark:text-zinc-700">v1.0</span>
        {/if}
      </a>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto bg-zinc-50/80 dark:bg-zinc-900">
    <!-- Mobile top bar -->
    <div class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/95 lg:hidden">
      <button
        onclick={() => (sidebarOpen = true)}
        class="rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{data.projectName}</p>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 pb-24 lg:px-8 lg:pb-6">
      {@render children()}
    </div>

    <nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-zinc-200/80 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-sm dark:border-zinc-800/70 dark:bg-zinc-950/95 lg:hidden">
      {#each mobileTabs as item}
        {@const active = isActive(item.href, $page.url.pathname)}
        <a
          href={item.href}
          class="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors {active ? 'text-accent-600 dark:text-accent-400' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'}"
        >
          <item.icon size={19} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>
  </main>
</div>

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
  import { page } from '$app/stores';
  import { goto, invalidateAll } from '$app/navigation';

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

  async function handleLogout() {
    await data.session?.access_token;
    const { error } = await (await fetch('/auth/callback?logout=true', { method: 'POST' })).json().catch(() => ({ error: null }));
    await goto('/auth/login');
  }
</script>

  <div class="flex h-full">
    <!-- Mobile sidebar backdrop -->
    {#if sidebarOpen}
      <button
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onclick={() => (sidebarOpen = false)}
        aria-label="Close sidebar"
      ></button>
    {/if}

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-white transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900 lg:static {sidebarCollapsed ? 'w-16' : 'w-60'} {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
    >
      <!-- Header -->
      <div class="flex h-14 items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
        {#if !sidebarCollapsed}
          <div class="flex-1 truncate">
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">BuildBoard</p>
          </div>
        {/if}
        <button
          onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
          class="hidden rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 lg:block"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={16} class="{sidebarCollapsed ? 'rotate-180' : ''} transition-transform" />
        </button>
        <button
          onclick={() => (sidebarOpen = false)}
          class="rounded p-1 text-zinc-400 hover:bg-zinc-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-2 py-3">
        {#each navGroups as group}
          {#if !sidebarCollapsed}
            <p class="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 first:mt-0">
              {group.label}
            </p>
          {:else}
            <div class="my-2 border-t border-zinc-100 dark:border-zinc-800"></div>
          {/if}
          {#each group.items as item}
            {@const active = isActive(item.href, $page.url.pathname)}
            <a
              href={item.href}
              class="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors {active
                ? 'bg-accent-50 font-semibold text-accent-600 dark:bg-accent-950 dark:text-accent-400'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}"
              onclick={() => (sidebarOpen = false)}
            >
              <item.icon size={18} />
              {#if !sidebarCollapsed}
                <span>{item.label}</span>
              {/if}
            </a>
          {/each}
        {/each}
      </nav>

      <!-- Footer -->
      <div class="border-t border-zinc-200 px-2 py-3 dark:border-zinc-800">
        <a
          href="/settings"
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Settings size={18} />
          {#if !sidebarCollapsed}
            <span>Settings</span>
          {/if}
        </a>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Mobile top bar -->
      <div class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
        <button
          onclick={() => (sidebarOpen = true)}
          class="rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">BuildBoard</p>
      </div>

      <div class="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        {@render children()}
      </div>
    </main>
  </div>

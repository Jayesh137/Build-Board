<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Moon from 'lucide-svelte/icons/moon';
  import Sun from 'lucide-svelte/icons/sun';
  import Save from 'lucide-svelte/icons/save';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import User from 'lucide-svelte/icons/user';
  import Github from 'lucide-svelte/icons/github';
  import Info from 'lucide-svelte/icons/info';

  interface Project {
    id: string;
    name: string;
    address: string;
    localAuthority: string;
    totalBudget: number | null;
    contingencyPct: number | null;
    startDate: string | null;
    targetCompletion: string | null;
    createdAt: string;
  }

  let { data, form } = $props();

  const project: Project | null = data.project;
  const userEmail: string | null = data.userEmail;

  let saving = $state(false);
  let showDeleteModal = $state(false);
  let deleteConfirmation = $state('');
  let deleting = $state(false);
  let darkMode = $state(false);
  let showSaved = $state(false);

  $effect(() => {
    darkMode = document.documentElement.classList.contains('dark');
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  function formatBudget(value: number | null): string {
    if (!value) return '';
    return value.toString();
  }

  async function handleLogout() {
    await fetch('/auth/callback?logout=true', { method: 'POST' }).catch(() => {});
    await goto('/auth/login');
  }

  $effect(() => {
    if (form?.success) {
      showSaved = true;
      const timer = setTimeout(() => {
        showSaved = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  });
</script>

<div class="mx-auto max-w-2xl space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
      Manage your project and preferences
    </p>
  </div>

  <!-- Project card -->
  {#if project}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Project</h2>
        <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Your build project details</p>
      </div>
      <div class="px-6 py-5">
        {#if form?.error}
          <div class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-400">
            {form.error}
          </div>
        {/if}

        {#if showSaved}
          <div class="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-400">
            Settings saved successfully
          </div>
        {/if}

        <form
          method="POST"
          action="?/update"
          use:enhance={() => {
            saving = true;
            return async ({ update }) => {
              saving = false;
              await update();
            };
          }}
          class="space-y-5"
        >
          <input type="hidden" name="projectId" value={project.id} />

          <Input
            label="Project Name"
            name="name"
            type="text"
            placeholder="e.g. Little Lodge"
            required
            value={project.name}
          />

          <Input
            label="Site Address"
            name="address"
            type="text"
            placeholder="e.g. 42 Oak Lane, Whetstone, London N20 9AB"
            required
            value={project.address}
          />

          <div class="space-y-1">
            <label for="totalBudget" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Total Budget
            </label>
            <div class="relative">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400 dark:text-zinc-500">&pound;</span>
              <input
                id="totalBudget"
                name="totalBudget"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 350000"
                value={formatBudget(project.totalBudget)}
                class="block w-full rounded-lg border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Input
            label="Target Completion Date"
            name="targetCompletion"
            type="date"
            value={project.targetCompletion ?? ''}
          />

          <div class="flex items-center justify-between border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <span class="text-xs text-zinc-400 dark:text-zinc-500">
              Created {new Date(project.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <Button type="submit" disabled={saving}>
              <Save size={16} />
              {#if saving}
                Saving...
              {:else}
                Save Changes
              {/if}
            </Button>
          </div>
        </form>
      </div>
    </div>
  {:else}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No project found</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          <a href="/setup" class="text-accent-600 hover:text-accent-700 dark:text-accent-400">Set up your project</a> to get started
        </p>
      </div>
    </div>
  {/if}

  <!-- Appearance card -->
  <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
    <div class="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h2>
      <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Customise how BuildBoard looks</p>
    </div>
    <div class="px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {#if darkMode}
              <Moon size={18} class="text-indigo-500 dark:text-indigo-400" />
            {:else}
              <Sun size={18} class="text-amber-500" />
            {/if}
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dark mode</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">
              {darkMode ? 'Dark theme active' : 'Light theme active'}
            </p>
          </div>
        </div>
        <button
          onclick={toggleDarkMode}
          class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 {darkMode ? 'bg-accent-600' : 'bg-zinc-200 dark:bg-zinc-700'}"
          role="switch"
          aria-checked={darkMode}
          aria-label="Toggle dark mode"
        >
          <span
            class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 {darkMode ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Account card -->
  <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
    <div class="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Account</h2>
      <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Manage your account</p>
    </div>
    <div class="px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <User size={18} class="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Email</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{userEmail ?? 'Not available'}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onclick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  </div>

  <!-- About card -->
  <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
    <div class="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">About</h2>
    </div>
    <div class="px-6 py-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-950/40">
            <Info size={18} class="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">BuildBoard v1.0</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500">Built for self-builders in the UK</p>
          </div>
        </div>
        <a
          href="https://github.com/Jayesh137/Build-Tracker"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Github size={14} />
          GitHub
        </a>
      </div>
    </div>
  </div>

  <!-- Danger Zone -->
  {#if project}
    <div class="rounded-xl border border-red-200/60 bg-white shadow-sm dark:border-red-900/40 dark:bg-zinc-900">
      <div class="border-b border-red-100 px-6 py-4 dark:border-red-900/30">
        <div class="flex items-center gap-2">
          <AlertTriangle size={15} class="text-red-500 dark:text-red-400" />
          <h2 class="text-base font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>
      </div>
      <div class="px-6 py-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Project</p>
            <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Permanently delete this project and all its data. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onclick={() => (showDeleteModal = true)}>
            <Trash2 size={14} />
            Delete Project
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Delete Confirmation Modal -->
<Modal bind:open={showDeleteModal} title="Delete Project">
  <div class="space-y-4">
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/30">
      <p class="text-sm text-red-700 dark:text-red-400">
        This will permanently delete your project <strong>{project?.name}</strong> and all associated data including timeline, budget entries, contacts, documents, photos, and snags. This action cannot be undone.
      </p>
    </div>

    <form
      method="POST"
      action="?/delete"
      use:enhance={() => {
        deleting = true;
        return async ({ update }) => {
          deleting = false;
          await update();
        };
      }}
      class="space-y-4"
    >
      <input type="hidden" name="projectId" value={project?.id ?? ''} />

      <div class="space-y-1">
        <label for="deleteConfirmation" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Type <strong>DELETE</strong> to confirm
        </label>
        <input
          id="deleteConfirmation"
          name="confirmation"
          type="text"
          bind:value={deleteConfirmation}
          placeholder="DELETE"
          autocomplete="off"
          class="block w-full rounded-lg border border-zinc-200 bg-white px-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      {#if form?.deleteError}
        <p class="text-sm text-red-600 dark:text-red-400">{form.deleteError}</p>
      {/if}

      <div class="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onclick={() => { showDeleteModal = false; deleteConfirmation = ''; }}>
          Cancel
        </Button>
        <Button variant="danger" type="submit" disabled={deleteConfirmation !== 'DELETE' || deleting}>
          {#if deleting}
            Deleting...
          {:else}
            Delete Project
          {/if}
        </Button>
      </div>
    </form>
  </div>
</Modal>

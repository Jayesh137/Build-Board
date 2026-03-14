<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import { Settings, User, Trash2, Moon, Sun, Save, AlertTriangle } from 'lucide-svelte';

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

  // Check initial dark mode state on mount
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

  // Show saved indicator when form succeeds
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

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
      Manage your project and account settings
    </p>
  </div>

  <!-- Project Settings -->
  <section>
    <div class="mb-3 flex items-center gap-2">
      <Settings size={16} class="text-zinc-400" />
      <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400">Project</h2>
    </div>

    {#if project}
      <Card padding="spacious">
        {#if form?.error}
          <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        {/if}

        {#if showSaved}
          <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
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
            placeholder="e.g. 42 Oak Lane New Build"
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
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500">&pound;</span>
              <input
                id="totalBudget"
                name="totalBudget"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 350000"
                value={formatBudget(project.totalBudget)}
                class="block w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          <Input
            label="Target Completion Date"
            name="targetCompletion"
            type="date"
            value={project.targetCompletion ?? ''}
          />

          <div class="flex items-center gap-3 pt-2">
            <div class="text-xs text-zinc-400 dark:text-zinc-500">
              Created {new Date(project.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div class="flex-1"></div>
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
      </Card>
    {:else}
      <Card>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No project found</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            <a href="/setup" class="text-accent-600 hover:text-accent-700 dark:text-accent-400">Set up your project</a> to get started
          </p>
        </div>
      </Card>
    {/if}
  </section>

  <!-- Appearance -->
  <section>
    <div class="mb-3 flex items-center gap-2">
      {#if darkMode}
        <Moon size={16} class="text-zinc-400" />
      {:else}
        <Sun size={16} class="text-zinc-400" />
      {/if}
      <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400">Appearance</h2>
    </div>

    <Card>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dark Mode</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Switch between light and dark themes</p>
        </div>
        <button
          onclick={toggleDarkMode}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {darkMode ? 'bg-accent-600' : 'bg-zinc-200 dark:bg-zinc-700'}"
          role="switch"
          aria-checked={darkMode}
          aria-label="Toggle dark mode"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform {darkMode ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
        </button>
      </div>
    </Card>
  </section>

  <!-- Account -->
  <section>
    <div class="mb-3 flex items-center gap-2">
      <User size={16} class="text-zinc-400" />
      <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400">Account</h2>
    </div>

    <Card>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Email</p>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">{userEmail ?? 'Not available'}</p>
          </div>
        </div>

        <div class="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button variant="secondary" onclick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </Card>
  </section>

  <!-- Danger Zone -->
  {#if project}
    <section>
      <div class="mb-3 flex items-center gap-2">
        <AlertTriangle size={16} class="text-red-400" />
        <h2 class="text-sm font-semibold uppercase tracking-wider text-red-400">Danger Zone</h2>
      </div>

      <div class="rounded-md border border-red-200 bg-white p-4 dark:border-red-800/50 dark:bg-zinc-900 lg:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Project</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Permanently delete this project and all its data. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onclick={() => (showDeleteModal = true)}>
            <Trash2 size={14} />
            Delete Project
          </Button>
        </div>
      </div>
    </section>
  {/if}
</div>

<!-- Delete Confirmation Modal -->
<Modal bind:open={showDeleteModal} title="Delete Project">
  <div class="space-y-4">
    <div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
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
          class="block w-full rounded-md border border-zinc-200 bg-white px-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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

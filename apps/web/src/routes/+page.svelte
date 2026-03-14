<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { CalendarDays, Wallet, Receipt, AlertTriangle, ClipboardCheck, GitBranch } from 'lucide-svelte';
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your build project at a glance</p>
  </div>

  <!-- Quick stats -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-accent-100 dark:bg-accent-900/30">
          <CalendarDays size={20} class="text-accent-600 dark:text-accent-400" />
        </div>
        <div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Tasks</p>
          <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">0 / 73</p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
          <Wallet size={20} class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Budget Spent</p>
          <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">--</p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
          <Receipt size={20} class="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">VAT Reclaimable</p>
          <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">--</p>
        </div>
      </div>
    </Card>

    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
          <AlertTriangle size={20} class="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">Open Snags</p>
          <p class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">0</p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Alerts & milestones -->
  <div class="grid gap-6 lg:grid-cols-3">
    <Card class="lg:col-span-2">
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alerts</h2>
      <div class="flex flex-col items-center justify-center py-8 text-center">
        <ClipboardCheck size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No alerts yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Set up your project to start tracking</p>
      </div>
    </Card>

    <Card>
      <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Milestones</h2>
      <div class="flex flex-col items-center justify-center py-8 text-center">
        <GitBranch size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No milestones yet</p>
      </div>
    </Card>
  </div>
</div>

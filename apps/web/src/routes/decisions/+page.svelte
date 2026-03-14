<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import Clock from 'lucide-svelte/icons/clock';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import Filter from 'lucide-svelte/icons/filter';

  interface Decision {
    id: string;
    title: string;
    category: string | null;
    status: 'not_started' | 'researching' | 'shortlisted' | 'decided';
    deadline: string | null;
    leadTimeDays: number | null;
    orderByDate: string | null;
    chosenOptionId: string | null;
    notes: string | null;
    createdAt: string;
  }

  let { data, form } = $props();

  const decisions: Decision[] = data.decisions ?? [];

  let showAddModal = $state(false);
  let filterStatus = $state('all');
  let filterCategory = $state('all');

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'researching', label: 'Researching' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'decided', label: 'Decided' },
  ];

  const categoryOptions = [
    { value: '', label: 'Select category...' },
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'Bathroom', label: 'Bathroom' },
    { value: 'Flooring', label: 'Flooring' },
    { value: 'Windows & Doors', label: 'Windows & Doors' },
    { value: 'Roofing', label: 'Roofing' },
    { value: 'Heating', label: 'Heating' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Landscaping', label: 'Landscaping' },
    { value: 'Structural', label: 'Structural' },
    { value: 'Finishes', label: 'Finishes' },
    { value: 'Appliances', label: 'Appliances' },
    { value: 'Other', label: 'Other' },
  ];

  const allCategoryFilterOptions = [
    { value: 'all', label: 'All categories' },
    ...categoryOptions.filter((o) => o.value !== ''),
  ];

  const today = new Date().toISOString().split('T')[0];

  function isOverdue(decision: Decision): boolean {
    if (!decision.deadline || decision.status === 'decided') return false;
    return decision.deadline < today;
  }

  function isOrderByUrgent(decision: Decision): boolean {
    if (!decision.orderByDate || decision.status === 'decided') return false;
    const daysUntil = Math.round(
      (new Date(decision.orderByDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil >= 0 && daysUntil <= 14;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '--';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function statusVariant(status: string): 'not_started' | 'in_progress' | 'done' | 'info' {
    switch (status) {
      case 'not_started':
        return 'not_started';
      case 'researching':
        return 'in_progress';
      case 'shortlisted':
        return 'info';
      case 'decided':
        return 'done';
      default:
        return 'not_started';
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'researching':
        return 'Researching';
      case 'shortlisted':
        return 'Shortlisted';
      case 'decided':
        return 'Decided';
      default:
        return status;
    }
  }

  const filteredDecisions = $derived(
    decisions
      .filter((d) => filterStatus === 'all' || d.status === filterStatus)
      .filter((d) => filterCategory === 'all' || d.category === filterCategory)
      .sort((a, b) => {
        // Sort by deadline: nulls last, then ascending
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      })
  );
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Decisions</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {decisions.length} decision{decisions.length !== 1 ? 's' : ''} to track
      </p>
    </div>
    <Button onclick={() => (showAddModal = true)} size="sm">
      <Plus size={16} />
      Add Decision
    </Button>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-1.5 text-zinc-400">
      <Filter size={14} />
      <span class="text-xs font-medium">Filter</span>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each statusOptions as opt}
        <button
          onclick={() => (filterStatus = opt.value)}
          class="rounded-full px-3 py-1 text-xs font-medium transition-colors {filterStatus === opt.value
            ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}"
        >
          {opt.label}
        </button>
      {/each}
    </div>
    <div class="w-40">
      <Select options={allCategoryFilterOptions} bind:value={filterCategory} />
    </div>
  </div>

  <!-- Decision cards -->
  {#if filteredDecisions.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <GitBranch size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          {decisions.length === 0 ? 'No decisions yet' : 'No decisions match your filters'}
        </p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {decisions.length === 0
            ? 'Track kitchen, bathroom, flooring and other choices'
            : 'Try adjusting your filters'}
        </p>
      </div>
    </Card>
  {:else}
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredDecisions as decision}
        {@const overdue = isOverdue(decision)}
        {@const orderByUrgent = isOrderByUrgent(decision)}
        <a href="/decisions/{decision.id}">
          <Card
            interactive
            class="{overdue ? 'border-red-300 dark:border-red-800' : ''}"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100 {overdue ? 'text-red-700 dark:text-red-400' : ''}">
                  {decision.title}
                </h3>
                <Badge variant={statusVariant(decision.status)} size="sm">
                  {statusLabel(decision.status)}
                </Badge>
              </div>

              {#if decision.category}
                <Badge variant="info" size="sm">{decision.category}</Badge>
              {/if}

              <div class="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                {#if decision.deadline}
                  <span class="inline-flex items-center gap-1 {overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}">
                    <CalendarDays size={12} />
                    {overdue ? 'Overdue: ' : ''}{formatDate(decision.deadline)}
                  </span>
                {/if}
                {#if decision.leadTimeDays}
                  <span class="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {decision.leadTimeDays}d lead
                  </span>
                {/if}
              </div>

              {#if orderByUrgent && decision.orderByDate}
                <div class="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <AlertTriangle size={12} />
                  Order by {formatDate(decision.orderByDate)}
                </div>
              {/if}

              {#if overdue}
                <div class="flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <AlertTriangle size={12} />
                  Decision overdue
                </div>
              {/if}
            </div>
          </Card>
        </a>
      {/each}
    </div>
  {/if}
</div>

<!-- Add Decision Modal -->
<Modal bind:open={showAddModal} title="Add Decision">
  <form method="POST" action="?/create" use:enhance class="space-y-4">
    <Input label="Title" name="title" required placeholder="e.g. Kitchen worktop material" />

    <Select label="Category" name="category" options={categoryOptions} />

    <div class="grid gap-4 sm:grid-cols-2">
      <Input label="Deadline" name="deadline" type="date" />
      <Input label="Lead Time (days)" name="leadTimeDays" type="number" min="0" placeholder="e.g. 28" />
    </div>

    <Input label="Linked Task ID" name="linkedTaskId" placeholder="Optional task reference" />

    <Textarea label="Notes" name="notes" placeholder="Any context or requirements..." rows={3} />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showAddModal = false)}>Cancel</Button>
      <Button type="submit">Add Decision</Button>
    </div>
  </form>
</Modal>

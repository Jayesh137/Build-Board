<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import Clock from 'lucide-svelte/icons/clock';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import CalendarDays from 'lucide-svelte/icons/calendar-days';
  import Package from 'lucide-svelte/icons/package';
  import GitBranch from 'lucide-svelte/icons/git-branch';
  import Truck from 'lucide-svelte/icons/truck';

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

  const statusFilters = [
    { value: 'all', label: 'All' },
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

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  function daysDiff(dateStr: string): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function isOverdue(decision: Decision): boolean {
    if (!decision.deadline || decision.status === 'decided') return false;
    return decision.deadline < todayStr;
  }

  function isDueSoon(decision: Decision): boolean {
    if (!decision.deadline || decision.status === 'decided') return false;
    const days = daysDiff(decision.deadline);
    return days >= 0 && days <= 7;
  }

  function isOrderByUrgent(decision: Decision): boolean {
    if (!decision.orderByDate || decision.status === 'decided') return false;
    const days = daysDiff(decision.orderByDate);
    return days >= 0 && days <= 14;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '--';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function deadlineLabel(decision: Decision): { text: string; urgent: boolean } {
    if (!decision.deadline) return { text: '', urgent: false };
    const days = daysDiff(decision.deadline);
    if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`, urgent: true };
    if (days === 0) return { text: 'Due today', urgent: true };
    if (days <= 7) return { text: `Due in ${days} day${days !== 1 ? 's' : ''}`, urgent: true };
    return { text: `Due in ${days} day${days !== 1 ? 's' : ''}`, urgent: false };
  }

  function statusBadgeClasses(status: string): string {
    switch (status) {
      case 'not_started': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
      case 'researching': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shortlisted': return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400';
      case 'decided': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'researching': return 'Researching';
      case 'shortlisted': return 'Shortlisted';
      case 'decided': return 'Decided';
      default: return status;
    }
  }

  function leftBorderColor(decision: Decision): string {
    if (isOverdue(decision)) return 'border-l-red-500';
    if (isDueSoon(decision) || isOrderByUrgent(decision)) return 'border-l-amber-400';
    return 'border-l-zinc-200 dark:border-l-zinc-700';
  }

  const filteredDecisions = $derived(
    decisions
      .filter((d) => filterStatus === 'all' || d.status === filterStatus)
      .sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      })
  );

  const filterCounts = $derived(() => {
    const counts: Record<string, number> = { all: decisions.length };
    for (const d of decisions) {
      counts[d.status] = (counts[d.status] ?? 0) + 1;
    }
    return counts;
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Decisions</h1>
        {#if decisions.length > 0}
          <span class="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {decisions.length}
          </span>
        {/if}
      </div>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Key choices you need to make for your build
      </p>
    </div>
    <Button onclick={() => (showAddModal = true)} size="sm">
      <Plus size={16} />
      Add Decision
    </Button>
  </div>

  <!-- Filter pills -->
  <div class="flex flex-wrap gap-2">
    {#each statusFilters as filter}
      {@const count = filterCounts()[filter.value] ?? 0}
      <button
        onclick={() => (filterStatus = filter.value)}
        class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150
          {filterStatus === filter.value
            ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'}"
      >
        {filter.label}
        {#if count > 0}
          <span class="tabular-nums {filterStatus === filter.value
            ? 'text-zinc-400 dark:text-zinc-500'
            : 'text-zinc-400 dark:text-zinc-500'}">
            {count}
          </span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Decision cards -->
  {#if filteredDecisions.length === 0}
    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <GitBranch size={24} class="text-zinc-400" />
        </div>
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {decisions.length === 0 ? 'No decisions yet' : 'No decisions match your filter'}
        </p>
        <p class="mt-1 max-w-xs text-sm text-zinc-400 dark:text-zinc-500">
          {decisions.length === 0
            ? 'Key choices you\'ll need to make will appear here.'
            : 'Try selecting a different status filter.'}
        </p>
        {#if decisions.length === 0}
          <Button onclick={() => (showAddModal = true)} size="sm" class="mt-5">
            <Plus size={16} />
            Add Decision
          </Button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredDecisions as decision}
        {@const overdue = isOverdue(decision)}
        {@const deadline = deadlineLabel(decision)}
        {@const orderUrgent = isOrderByUrgent(decision)}
        <a href="/decisions/{decision.id}" class="group block">
          <div class="relative rounded-xl border border-l-4 border-zinc-200/50 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-zinc-300/60 dark:border-zinc-800/50 dark:bg-zinc-900 dark:hover:border-zinc-700/60 {leftBorderColor(decision)}">
            <!-- Title + status -->
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                {decision.title}
              </h3>
              <span class="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium {statusBadgeClasses(decision.status)}">
                {statusLabel(decision.status)}
              </span>
            </div>

            <!-- Category -->
            {#if decision.category}
              <span class="mt-2 inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
                {decision.category}
              </span>
            {/if}

            <!-- Metadata row -->
            <div class="mt-4 flex flex-col gap-2">
              <!-- Deadline countdown -->
              {#if deadline.text}
                <div class="flex items-center gap-1.5 text-xs {overdue ? 'text-red-600 font-medium dark:text-red-400' : deadline.urgent ? 'text-amber-600 font-medium dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}">
                  <CalendarDays size={13} class={overdue ? 'text-red-500' : deadline.urgent ? 'text-amber-500' : 'text-zinc-400'} />
                  {deadline.text}
                </div>
              {/if}

              <!-- Order-by date -->
              {#if decision.orderByDate}
                <div class="flex items-center gap-1.5 text-xs {orderUrgent ? 'text-amber-600 font-medium dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}">
                  <Package size={13} class={orderUrgent ? 'text-amber-500' : 'text-zinc-400'} />
                  Order by: {formatDate(decision.orderByDate)}
                </div>
              {/if}

              <!-- Lead time -->
              {#if decision.leadTimeDays}
                <div class="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <Truck size={13} class="text-zinc-300 dark:text-zinc-600" />
                  {Math.ceil(decision.leadTimeDays / 7)} week{Math.ceil(decision.leadTimeDays / 7) !== 1 ? 's' : ''} lead time
                </div>
              {/if}
            </div>

            <!-- Notes preview -->
            {#if decision.notes}
              <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                {decision.notes}
              </p>
            {/if}

            <!-- Urgency banners -->
            {#if overdue}
              <div class="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertTriangle size={13} />
                Decision overdue
              </div>
            {/if}

            {#if orderUrgent && decision.orderByDate && !overdue}
              <div class="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <AlertTriangle size={13} />
                Must order soon
              </div>
            {/if}
          </div>
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

    <Input label="Order By Date" name="orderByDate" type="date" />

    <Input label="Linked Task ID" name="linkedTaskId" placeholder="Optional task reference" />

    <Textarea label="Notes" name="notes" placeholder="Any context or requirements..." rows={3} />

    {#if form?.error}
      <div class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {form.error}
      </div>
    {/if}

    <div class="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <Button variant="secondary" type="button" onclick={() => (showAddModal = false)}>Cancel</Button>
      <Button type="submit">Add Decision</Button>
    </div>
  </form>
</Modal>

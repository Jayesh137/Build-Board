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
    ArrowLeft,
    Clock,
    CalendarDays,
    Check,
    Plus,
    ExternalLink,
    ThumbsUp,
    ThumbsDown,
    LinkIcon,
  } from 'lucide-svelte';

  interface DecisionOption {
    id: string;
    name: string;
    supplier: string | null;
    costPence: number | null;
    pros: string | null;
    cons: string | null;
    url: string | null;
    notes: string | null;
  }

  interface Decision {
    id: string;
    title: string;
    category: string | null;
    status: 'not_started' | 'researching' | 'shortlisted' | 'decided';
    deadline: string | null;
    leadTimeDays: number | null;
    orderByDate: string | null;
    chosenOptionId: string | null;
    linkedTaskId: string | null;
    notes: string | null;
    createdAt: string;
  }

  let { data, form } = $props();

  const decision: Decision | null = data.decision;
  const options: DecisionOption[] = data.options ?? [];

  let showAddOption = $state(false);
  let showEditDecision = $state(false);

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '--';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatCurrency(pence: number | null): string {
    if (pence === null || pence === undefined) return '--';
    const pounds = pence / 100;
    const parts = pounds.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `\u00A3${intPart}.${parts[1]}`;
  }

  function statusVariant(status: string): 'not_started' | 'in_progress' | 'done' | 'info' {
    switch (status) {
      case 'not_started': return 'not_started';
      case 'researching': return 'in_progress';
      case 'shortlisted': return 'info';
      case 'decided': return 'done';
      default: return 'not_started';
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

  const statusOptions = [
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
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/decisions" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
    <ArrowLeft size={16} />
    Back to Decisions
  </a>

  {#if !decision}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">Decision not found</p>
      </div>
    </Card>
  {:else}
    <!-- Decision header -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{decision.title}</h1>
          <Badge variant={statusVariant(decision.status)}>
            {statusLabel(decision.status)}
          </Badge>
        </div>
        {#if decision.category}
          <Badge variant="info" size="sm">{decision.category}</Badge>
        {/if}
      </div>
      <Button variant="secondary" size="sm" onclick={() => (showEditDecision = true)}>
        Edit
      </Button>
    </div>

    <!-- Key info cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30">
            <CalendarDays size={18} class="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Deadline</p>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(decision.deadline)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
            <Clock size={18} class="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Lead Time</p>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {decision.leadTimeDays ? `${decision.leadTimeDays} days` : '--'}
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30">
            <CalendarDays size={18} class="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Order By</p>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(decision.orderByDate)}</p>
          </div>
        </div>
      </Card>
      {#if decision.linkedTaskId}
        <Card interactive>
          <a href="/timeline?task={decision.linkedTaskId}" class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
              <LinkIcon size={18} class="text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Linked Task</p>
              <p class="text-sm font-medium text-accent-600 dark:text-accent-400">View Task</p>
            </div>
          </a>
        </Card>
      {/if}
    </div>

    <!-- Notes -->
    {#if decision.notes}
      <Card>
        <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes</h2>
        <p class="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{decision.notes}</p>
      </Card>
    {/if}

    <!-- Options -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Options ({options.length})
        </h2>
        <Button size="sm" variant="secondary" onclick={() => (showAddOption = true)}>
          <Plus size={14} />
          Add Option
        </Button>
      </div>

      {#if options.length === 0}
        <Card>
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <p class="text-sm text-zinc-500 dark:text-zinc-400">No options added yet</p>
            <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Compare suppliers, costs and trade-offs</p>
          </div>
        </Card>
      {:else}
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {#each options as option}
            {@const isChosen = decision.chosenOptionId === option.id}
            <Card class="{isChosen ? 'border-green-400 ring-1 ring-green-400 dark:border-green-600 dark:ring-green-600' : ''}">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{option.name}</h3>
                    {#if option.supplier}
                      <p class="text-xs text-zinc-500 dark:text-zinc-400">{option.supplier}</p>
                    {/if}
                  </div>
                  {#if isChosen}
                    <Badge variant="done" size="sm">
                      <Check size={12} />
                      Chosen
                    </Badge>
                  {/if}
                </div>

                {#if option.costPence !== null}
                  <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(option.costPence)}
                  </p>
                {/if}

                {#if option.pros}
                  <div class="space-y-1">
                    <div class="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <ThumbsUp size={12} />
                      Pros
                    </div>
                    <p class="whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">{option.pros}</p>
                  </div>
                {/if}

                {#if option.cons}
                  <div class="space-y-1">
                    <div class="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                      <ThumbsDown size={12} />
                      Cons
                    </div>
                    <p class="whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">{option.cons}</p>
                  </div>
                {/if}

                {#if option.url}
                  <a
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-accent-600 hover:text-accent-700 dark:text-accent-400"
                  >
                    <ExternalLink size={12} />
                    View link
                  </a>
                {/if}

                {#if option.notes}
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">{option.notes}</p>
                {/if}

                {#if !isChosen && decision.status !== 'decided'}
                  <form method="POST" action="?/chooseOption" use:enhance>
                    <input type="hidden" name="optionId" value={option.id} />
                    <Button size="sm" variant="secondary" type="submit" class="w-full">
                      <Check size={14} />
                      Choose this option
                    </Button>
                  </form>
                {/if}
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Add Option Modal -->
<Modal bind:open={showAddOption} title="Add Option">
  <form method="POST" action="?/addOption" use:enhance class="space-y-4">
    <Input label="Name" name="name" required placeholder="e.g. Quartz composite" />
    <Input label="Supplier" name="supplier" placeholder="e.g. Howdens" />
    <Input label="Cost (\u00A3)" name="costPence" type="number" step="0.01" min="0" placeholder="e.g. 2500.00" />
    <Input label="Link / URL" name="url" type="url" placeholder="https://..." />
    <Textarea label="Pros" name="pros" placeholder="What's good about this option..." rows={2} />
    <Textarea label="Cons" name="cons" placeholder="Downsides or concerns..." rows={2} />
    <Textarea label="Notes" name="notes" placeholder="Any other details..." rows={2} />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" onclick={() => (showAddOption = false)}>Cancel</Button>
      <Button type="submit">Add Option</Button>
    </div>
  </form>
</Modal>

<!-- Edit Decision Modal -->
{#if decision}
  <Modal bind:open={showEditDecision} title="Edit Decision">
    <form method="POST" action="?/update" use:enhance class="space-y-4">
      <Input label="Title" name="title" value={decision.title} required />
      <Select label="Category" name="category" options={categoryOptions} value={decision.category ?? ''} />
      <Select label="Status" name="status" options={statusOptions} value={decision.status} />
      <div class="grid gap-4 sm:grid-cols-2">
        <Input label="Deadline" name="deadline" type="date" value={decision.deadline ?? ''} />
        <Input label="Lead Time (days)" name="leadTimeDays" type="number" min="0" value={decision.leadTimeDays?.toString() ?? ''} />
      </div>
      <Textarea label="Notes" name="notes" value={decision.notes ?? ''} rows={3} />

      {#if form?.error}
        <p class="text-sm text-red-600">{form.error}</p>
      {/if}

      <div class="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onclick={() => (showEditDecision = false)}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  </Modal>
{/if}

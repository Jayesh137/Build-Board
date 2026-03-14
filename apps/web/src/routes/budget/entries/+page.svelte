<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { ArrowLeft, Plus, Filter } from 'lucide-svelte';

  interface BudgetEntry {
    id: string;
    categoryId: string;
    categoryName?: string;
    type: 'quote' | 'invoice' | 'payment';
    supplier: string | null;
    description: string | null;
    amount: number;
    vatAmount: number;
    date: string;
    status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'partially_paid';
  }

  interface BudgetCategory {
    id: string;
    name: string;
  }

  let { data } = $props();

  const entries: BudgetEntry[] = data.entries ?? [];
  const categories: BudgetCategory[] = data.categories ?? [];

  let filterType = $state($page.url.searchParams.get('type') ?? '');
  let filterCategory = $state($page.url.searchParams.get('category') ?? '');
  let filterStatus = $state($page.url.searchParams.get('status') ?? '');

  function formatCurrency(pence: number): string {
    const pounds = pence / 100;
    const sign = pounds < 0 ? '-' : '';
    const abs = Math.abs(pounds);
    const parts = abs.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sign}\u00A3${intPart}.${parts[1]}`;
  }

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'quote', label: 'Quote' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'payment', label: 'Payment' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
    { value: 'partially_paid', label: 'Partially Paid' },
  ];

  const categoryOptions = $derived([
    { value: '', label: 'All Categories' },
    ...categories.map((c: BudgetCategory) => ({ value: c.id, label: c.name })),
  ]);

  const typeBadgeVariant: Record<string, 'info' | 'warning' | 'done'> = {
    quote: 'info',
    invoice: 'warning',
    payment: 'done',
  };

  function applyFilters() {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterCategory) params.set('category', filterCategory);
    if (filterStatus) params.set('status', filterStatus);
    goto(`/budget/entries?${params.toString()}`);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <a href="/budget" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={16} />
        Back to Budget
      </a>
      <h1 class="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Budget Entries</h1>
    </div>
    <a href="/budget/entries/new">
      <Button size="sm">
        <Plus size={16} />
        New Entry
      </Button>
    </a>
  </div>

  <!-- Filters -->
  <Card padding="compact">
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex items-center gap-2">
        <Filter size={16} class="text-zinc-400" />
      </div>
      <select
        bind:value={filterType}
        onchange={applyFilters}
        class="rounded-md border border-zinc-200 bg-white px-3 h-9 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {#each typeOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <select
        bind:value={filterCategory}
        onchange={applyFilters}
        class="rounded-md border border-zinc-200 bg-white px-3 h-9 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {#each categoryOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
      <select
        bind:value={filterStatus}
        onchange={applyFilters}
        class="rounded-md border border-zinc-200 bg-white px-3 h-9 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {#each statusOptions as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
  </Card>

  <!-- Table -->
  {#if entries.length === 0}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No entries found</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Add your first budget entry to start tracking</p>
      </div>
    </Card>
  {:else}
    <Card padding="compact">
      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800">
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Date</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Supplier</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Description</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Amount</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">VAT</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Type</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            {#each entries as entry}
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td class="whitespace-nowrap px-3 py-2.5 text-zinc-500">{formatDate(entry.date)}</td>
                <td class="px-3 py-2.5 text-zinc-900 dark:text-zinc-100">{entry.supplier ?? '-'}</td>
                <td class="max-w-[250px] truncate px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.description ?? '-'}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.amount)}</td>
                <td class="whitespace-nowrap px-3 py-2.5 text-right text-zinc-500">{formatCurrency(entry.vatAmount)}</td>
                <td class="px-3 py-2.5 text-center">
                  <Badge variant={typeBadgeVariant[entry.type] ?? 'info'}>
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </Badge>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <StatusBadge status={entry.status} />
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {#each entries as entry}
          <div class="px-3 py-3 space-y-1.5">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{entry.supplier ?? 'No supplier'}</p>
                <p class="text-xs text-zinc-500">{entry.description ?? '-'}</p>
              </div>
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.amount)}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-zinc-400">{formatDate(entry.date)}</span>
              <Badge variant={typeBadgeVariant[entry.type] ?? 'info'}>
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </Badge>
              <StatusBadge status={entry.status} />
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/if}
</div>

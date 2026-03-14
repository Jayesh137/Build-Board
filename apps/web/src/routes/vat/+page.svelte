<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import Download from 'lucide-svelte/icons/download';
  import Clock from 'lucide-svelte/icons/clock';
  import Receipt from 'lucide-svelte/icons/receipt';
  import CheckCircle from 'lucide-svelte/icons/circle-check';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import XCircle from 'lucide-svelte/icons/circle-x';

  interface VATSummary {
    totalReclaimable: number;
    totalNotReclaimable: number;
    totalNeedsReview: number;
    reclaimableCount: number;
    notReclaimableCount: number;
    needsReviewCount: number;
    deadlineDate: string | null;
  }

  interface VATEntry {
    id: string;
    invoiceNumber: string | null;
    supplierName: string;
    description: string;
    netAmount: number;
    vatAmount: number;
    invoiceTotal: number;
    invoiceDate: string;
    source: string;
    reclaimable: 'yes' | 'no' | 'needs_review';
    validated: boolean;
  }

  let { data } = $props();

  const summary: VATSummary | null = data.summary;
  const entries: VATEntry[] = data.entries ?? [];

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

  function daysUntilDeadline(deadline: string): number {
    const [year, month, day] = deadline.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const deadlineDays = $derived(summary?.deadlineDate ? daysUntilDeadline(summary.deadlineDate) : null);

  function deadlineColor(days: number): string {
    if (days < 0) return 'text-red-600 dark:text-red-400';
    if (days < 30) return 'text-red-600 dark:text-red-400';
    if (days < 90) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  }

  const flaggedEntries = $derived(entries.filter((e: VATEntry) => e.reclaimable === 'needs_review'));

  const sourceLabels: Record<string, string> = {
    direct_purchase: 'Direct Purchase',
    contractor_zero_rated: 'Contractor (Zero Rated)',
    contractor_vat_error: 'Contractor (VAT Error)',
  };

  const reclaimableVariant: Record<string, 'done' | 'blocked' | 'warning'> = {
    yes: 'done',
    no: 'blocked',
    needs_review: 'warning',
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">VAT Reclaim</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track VAT on materials for your self-build reclaim</p>
    </div>
    <div class="flex gap-2">
      <Button variant="secondary" size="sm">
        <Download size={16} />
        Export
      </Button>
      <a href="/vat/new">
        <Button size="sm">
          <Plus size={16} />
          New Entry
        </Button>
      </a>
    </div>
  </div>

  <!-- Summary cards -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <!-- Reclaimable total -->
    <Card class="sm:col-span-2 lg:col-span-1">
      <div class="text-center">
        <p class="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Reclaimable</p>
        <p class="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
          {summary ? formatCurrency(summary.totalReclaimable) : '--'}
        </p>
      </div>
    </Card>

    <!-- Deadline countdown -->
    <Card>
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
          <Clock size={20} class="text-zinc-500" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Deadline</p>
          {#if deadlineDays !== null}
            <p class="text-lg font-semibold {deadlineColor(deadlineDays)}">
              {#if deadlineDays < 0}
                {Math.abs(deadlineDays)} days overdue
              {:else}
                {deadlineDays} days left
              {/if}
            </p>
          {:else}
            <p class="text-lg font-semibold text-zinc-400">--</p>
          {/if}
        </div>
      </div>
    </Card>

    <!-- Status counts -->
    <Card>
      <p class="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">By Status</p>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <CheckCircle size={14} class="text-green-500" />
          <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{summary?.reclaimableCount ?? 0}</span>
          <span class="text-xs text-zinc-400">yes</span>
        </div>
        <div class="flex items-center gap-1.5">
          <XCircle size={14} class="text-red-500" />
          <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{summary?.notReclaimableCount ?? 0}</span>
          <span class="text-xs text-zinc-400">no</span>
        </div>
        <div class="flex items-center gap-1.5">
          <AlertTriangle size={14} class="text-amber-500" />
          <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{summary?.needsReviewCount ?? 0}</span>
          <span class="text-xs text-zinc-400">review</span>
        </div>
      </div>
    </Card>
  </div>

  <!-- Flagged entries -->
  {#if flaggedEntries.length > 0}
    <Card>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <AlertTriangle size={16} class="text-amber-500" />
        Needs Review ({flaggedEntries.length})
      </h2>
      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        {#each flaggedEntries as entry}
          <div class="flex items-center justify-between py-2.5">
            <div>
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{entry.supplierName}</p>
              <p class="text-xs text-zinc-500">{entry.description}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.vatAmount)}</p>
              <Badge variant="warning" size="sm">Needs Review</Badge>
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- All entries table -->
  <div>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">All VAT Entries</h2>
    {#if entries.length === 0}
      <Card>
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <Receipt size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No VAT entries yet</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Add entries for materials you purchased directly</p>
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
                <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Invoice #</th>
                <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Description</th>
                <th class="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">Net</th>
                <th class="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-400">VAT</th>
                <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Source</th>
                <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Reclaimable</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
              {#each entries as entry}
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td class="whitespace-nowrap px-3 py-2.5 text-zinc-500">{formatDate(entry.invoiceDate)}</td>
                  <td class="px-3 py-2.5 text-zinc-900 dark:text-zinc-100">{entry.supplierName}</td>
                  <td class="px-3 py-2.5 text-zinc-500">{entry.invoiceNumber ?? '-'}</td>
                  <td class="max-w-[200px] truncate px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.description}</td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-right text-zinc-700 dark:text-zinc-300">{formatCurrency(entry.netAmount)}</td>
                  <td class="whitespace-nowrap px-3 py-2.5 text-right font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.vatAmount)}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="text-xs text-zinc-500">{sourceLabels[entry.source] ?? entry.source}</span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <Badge variant={reclaimableVariant[entry.reclaimable] ?? 'not_started'}>
                      {entry.reclaimable === 'yes' ? 'Yes' : entry.reclaimable === 'no' ? 'No' : 'Review'}
                    </Badge>
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
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{entry.supplierName}</p>
                  <p class="text-xs text-zinc-500">{entry.description}</p>
                </div>
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(entry.vatAmount)}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-400">{formatDate(entry.invoiceDate)}</span>
                <Badge variant={reclaimableVariant[entry.reclaimable] ?? 'not_started'}>
                  {entry.reclaimable === 'yes' ? 'Reclaimable' : entry.reclaimable === 'no' ? 'Not Reclaimable' : 'Needs Review'}
                </Badge>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</div>

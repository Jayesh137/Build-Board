<script lang="ts">
  import Plus from 'lucide-svelte/icons/plus';
  import Download from 'lucide-svelte/icons/download';
  import Clock from 'lucide-svelte/icons/clock';
  import Receipt from 'lucide-svelte/icons/receipt';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
  import CircleX from 'lucide-svelte/icons/circle-x';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';
  import ChevronUp from 'lucide-svelte/icons/chevron-up';
  import HelpCircle from 'lucide-svelte/icons/circle-help';

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

  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

  function formatCurrency(pence: number): string {
    return gbp.format(pence / 100);
  }

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

  const reclaimableConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    yes: {
      label: 'Reclaimable',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      dot: 'bg-green-500',
    },
    no: {
      label: 'Non-reclaimable',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
    },
    needs_review: {
      label: 'Needs Review',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
    },
  };

  let rulesExpanded = $state(false);
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">VAT Reclaim</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track reclaimable VAT on your self-build</p>
    </div>
    <div class="flex gap-2">
      <button
        class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 h-9 px-3.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
      >
        <Download size={15} />
        Export for HMRC
      </button>
      <a
        href="/vat/new"
        class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-600 text-white h-9 px-3.5 text-sm font-medium transition-colors hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600"
      >
        <Plus size={15} />
        New Entry
      </a>
    </div>
  </div>

  <!-- Summary card -->
  <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm p-5 lg:p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <!-- Reclaimable total -->
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
          <Receipt size={22} class="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Total Reclaimable</p>
          <p class="mt-0.5 text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
            {summary ? formatCurrency(summary.totalReclaimable) : '\u00A30.00'}
          </p>
        </div>
      </div>

      <!-- Stat pills -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-green-200/50 dark:ring-green-800/50">
          <CircleCheck size={13} />
          {summary?.reclaimableCount ?? 0} reclaimable
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-200/50 dark:ring-amber-800/50">
          <TriangleAlert size={13} />
          {summary?.needsReviewCount ?? 0} needs review
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-200/50 dark:ring-red-800/50">
          <CircleX size={13} />
          {summary?.notReclaimableCount ?? 0} non-reclaimable
        </span>
      </div>
    </div>

    <!-- Deadline -->
    <div class="mt-5 flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-3.5 py-2.5">
      <Clock size={14} class="text-zinc-400 flex-shrink-0" />
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Claim within 6 months of Completion Certificate
        {#if deadlineDays !== null}
          <span class="font-semibold {deadlineColor(deadlineDays)}">
            &mdash;
            {#if deadlineDays < 0}
              {Math.abs(deadlineDays)} days overdue
            {:else}
              {deadlineDays} days remaining
            {/if}
          </span>
        {/if}
      </p>
    </div>
  </div>

  <!-- Entries list -->
  <div>
    <p class="mb-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">VAT Entries</p>

    {#if entries.length === 0}
      <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <Receipt size={24} class="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No VAT entries yet</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Add entries for materials you purchased directly
          </p>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <!-- Desktop table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-100 dark:border-zinc-800">
                <th class="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Supplier</th>
                <th class="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Description</th>
                <th class="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Net</th>
                <th class="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-zinc-400 font-medium">VAT</th>
                <th class="px-4 py-3 text-center text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Status</th>
                <th class="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {#each entries as entry}
                {@const rc = reclaimableConfig[entry.reclaimable] ?? reclaimableConfig.needs_review}
                <tr class="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td class="px-4 py-3">
                    <p class="font-medium text-zinc-900 dark:text-zinc-100">{entry.supplierName}</p>
                  </td>
                  <td class="px-4 py-3 max-w-[220px]">
                    <p class="truncate text-zinc-500 dark:text-zinc-400">{entry.description}</p>
                  </td>
                  <td class="px-4 py-3 text-right whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                    {formatCurrency(entry.netAmount)}
                  </td>
                  <td class="px-4 py-3 text-right whitespace-nowrap font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(entry.vatAmount)}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {rc.bg} {rc.text}">
                      <span class="h-1.5 w-1.5 rounded-full {rc.dot}"></span>
                      {rc.label}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                    {formatDate(entry.invoiceDate)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {#each entries as entry}
            {@const rc = reclaimableConfig[entry.reclaimable] ?? reclaimableConfig.needs_review}
            <div class="px-4 py-3.5 space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-zinc-900 dark:text-zinc-100">{entry.supplierName}</p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">{entry.description}</p>
                </div>
                <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex-shrink-0">
                  {formatCurrency(entry.vatAmount)}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-400">{formatDate(entry.invoiceDate)}</span>
                <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium {rc.bg} {rc.text}">
                  <span class="h-1.5 w-1.5 rounded-full {rc.dot}"></span>
                  {rc.label}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Info card: What can I reclaim? -->
  <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm">
    <button
      onclick={() => (rulesExpanded = !rulesExpanded)}
      class="flex w-full items-center justify-between p-4 lg:px-5 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 rounded-xl"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <HelpCircle size={16} class="text-blue-600 dark:text-blue-400" />
        </div>
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-100">What can I reclaim?</span>
      </div>
      {#if rulesExpanded}
        <ChevronUp size={16} class="text-zinc-400" />
      {:else}
        <ChevronDown size={16} class="text-zinc-400" />
      {/if}
    </button>

    {#if rulesExpanded}
      <div class="border-t border-zinc-100 dark:border-zinc-800 px-4 lg:px-5 py-4 space-y-3">
        <div class="grid gap-2.5 text-sm">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CircleCheck size={12} class="text-green-600 dark:text-green-400" />
            </span>
            <div>
              <p class="font-medium text-zinc-900 dark:text-zinc-100">Building materials</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Bricks, timber, cement, roofing, insulation, etc.</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <span class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">0%</span>
            </span>
            <div>
              <p class="font-medium text-zinc-900 dark:text-zinc-100">Contractor labour (new build)</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Zero-rated &mdash; no VAT should be charged</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <CircleX size={12} class="text-red-600 dark:text-red-400" />
            </span>
            <div>
              <p class="font-medium text-zinc-900 dark:text-zinc-100">Professional fees</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Architect, structural engineer, planning consultant</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CircleCheck size={12} class="text-green-600 dark:text-green-400" />
            </span>
            <div>
              <p class="font-medium text-zinc-900 dark:text-zinc-100">Fitted kitchens &amp; bathrooms</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Only if permanently fixed to the building</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <CircleX size={12} class="text-red-600 dark:text-red-400" />
            </span>
            <div>
              <p class="font-medium text-zinc-900 dark:text-zinc-100">Freestanding appliances</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Fridge, washing machine, dishwasher, etc.</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

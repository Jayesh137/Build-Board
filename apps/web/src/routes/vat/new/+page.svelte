<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import Upload from 'lucide-svelte/icons/upload';
  import CheckCircle from 'lucide-svelte/icons/circle-check';

  let { form } = $props();

  const sourceOptions = [
    { value: 'direct_purchase', label: 'Direct Purchase (bought materials yourself)' },
    { value: 'contractor_zero_rated', label: 'Contractor - Zero Rated' },
    { value: 'contractor_vat_error', label: 'Contractor - VAT Charged in Error' },
  ];

  let netAmountValue = $state('');
  let vatAmountValue = $state('');

  const invoiceTotal = $derived(() => {
    const net = parseFloat(netAmountValue) || 0;
    const vat = parseFloat(vatAmountValue) || 0;
    return (net + vat).toFixed(2);
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a href="/vat" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
      <ArrowLeft size={16} />
      Back to VAT Reclaim
    </a>
    <h1 class="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">New VAT Entry</h1>
  </div>

  {#if form?.success}
    <Card>
      <div class="flex flex-col items-center py-6 text-center">
        <CheckCircle size={48} class="mb-3 text-green-500" />
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Entry Created</h2>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your VAT entry has been classified.</p>

        {#if form.result}
          <div class="mt-4 w-full max-w-sm rounded-md border border-zinc-200 p-4 text-left dark:border-zinc-800">
            <p class="text-xs font-medium uppercase tracking-wider text-zinc-400">Classification Result</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-sm text-zinc-700 dark:text-zinc-300">Reclaimable:</span>
              {#if form.result.reclaimable === 'yes'}
                <Badge variant="done">Yes</Badge>
              {:else if form.result.reclaimable === 'no'}
                <Badge variant="blocked">No</Badge>
              {:else}
                <Badge variant="warning">Needs Review</Badge>
              {/if}
            </div>
          </div>
        {/if}

        <div class="mt-6 flex gap-3">
          <a href="/vat/new">
            <Button variant="secondary">Add Another</Button>
          </a>
          <a href="/vat">
            <Button>View All Entries</Button>
          </a>
        </div>
      </div>
    </Card>
  {:else}
    <Card>
      <form method="POST" use:enhance class="space-y-4">
        <Input label="Supplier Name" name="supplierName" required placeholder="e.g. Travis Perkins, Jewson" />

        <div class="grid gap-4 sm:grid-cols-2">
          <Input label="Invoice Number" name="invoiceNumber" placeholder="INV-001" />
          <Input label="Invoice Date" name="invoiceDate" type="date" required />
        </div>

        <Input label="Description" name="description" required placeholder="e.g. Bricks, timber, insulation" />

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-1">
            <label for="netAmount" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Net Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">&pound;</span>
              <input
                id="netAmount"
                name="netAmount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                bind:value={netAmountValue}
                class="block w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label for="vatAmount" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">VAT Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">&pound;</span>
              <input
                id="vatAmount"
                name="vatAmount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                bind:value={vatAmountValue}
                class="block w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div class="space-y-1">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Invoice Total</label>
            <div class="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              &pound;{invoiceTotal()}
            </div>
          </div>
        </div>

        <Select label="Source" name="source" options={sourceOptions} required />

        <!-- Receipt upload area -->
        <div class="space-y-1">
          <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Receipt / Invoice</label>
          <div class="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-zinc-200 px-6 py-8 text-center transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600">
            <Upload size={24} class="mb-2 text-zinc-400" />
            <p class="text-sm text-zinc-600 dark:text-zinc-400">Drop file here or click to upload</p>
            <p class="mt-1 text-xs text-zinc-400">PDF, JPG, PNG up to 10MB</p>
            <input
              type="file"
              name="receipt"
              accept=".pdf,.jpg,.jpeg,.png"
              class="mt-3 text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
            />
          </div>
        </div>

        <Textarea label="Notes" name="notes" placeholder="Any additional notes..." rows={3} />

        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}

        <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <a href="/vat">
            <Button variant="secondary" type="button">Cancel</Button>
          </a>
          <Button type="submit">Submit Entry</Button>
        </div>
      </form>
    </Card>
  {/if}
</div>

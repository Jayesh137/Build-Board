<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';

  interface BudgetCategory {
    id: string;
    name: string;
  }

  let { data, form } = $props();

  const categories: BudgetCategory[] = data.categories ?? [];

  const categoryOptions = $derived(
    categories.map((c: BudgetCategory) => ({ value: c.id, label: c.name }))
  );

  const typeOptions = [
    { value: 'quote', label: 'Quote' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'payment', label: 'Payment' },
  ];
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a href="/budget/entries" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
      <ArrowLeft size={16} />
      Back to Entries
    </a>
    <h1 class="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">New Budget Entry</h1>
  </div>

  <Card>
    <form method="POST" use:enhance class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <Select label="Category" name="categoryId" options={categoryOptions} required />
        <Select label="Type" name="type" options={typeOptions} required />
      </div>

      <Input label="Supplier" name="supplier" placeholder="e.g. Travis Perkins" />

      <Input label="Description" name="description" placeholder="What is this for?" />

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <label for="amount" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">&pound;</span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
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
              placeholder="0.00"
              class="block w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>

      <Input label="Date" name="date" type="date" required />

      <Textarea label="Notes" name="notes" placeholder="Any additional notes..." rows={3} />

      {#if form?.error}
        <p class="text-sm text-red-600">{form.error}</p>
      {/if}

      <div class="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <a href="/budget/entries">
          <Button variant="secondary" type="button">Cancel</Button>
        </a>
        <Button type="submit">Create Entry</Button>
      </div>
    </form>
  </Card>
</div>

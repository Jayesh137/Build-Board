<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Hammer from 'lucide-svelte/icons/hammer';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';

  interface Props {
    form: {
      error?: string;
      name?: string;
      address?: string;
      totalBudget?: string;
      targetCompletion?: string;
    } | null;
  }

  let { form }: Props = $props();
  let submitting = $state(false);
</script>

<div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
  <div class="w-full max-w-lg">
    <!-- Header -->
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/30">
        <Hammer size={28} class="text-accent-600 dark:text-accent-400" />
      </div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Let's get your build project organised</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Tell us about your self-build so we can set up your timeline, budget categories, and inspection schedule.
      </p>
    </div>

    <!-- Step indicator -->
    <div class="mb-6 flex items-center justify-center gap-2">
      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white dark:bg-accent-500">
        1
      </div>
      <span class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Project Details</span>
    </div>

    <!-- Form -->
    <Card padding="spacious">
      {#if form?.error}
        <div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {form.error}
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          submitting = true;
          return async ({ update }) => {
            submitting = false;
            await update();
          };
        }}
        class="space-y-5"
      >
        <Input
          label="Project Name"
          name="name"
          type="text"
          placeholder="e.g. 42 Oak Lane New Build"
          required
          value={form?.name ?? ''}
        />

        <Input
          label="Site Address"
          name="address"
          type="text"
          placeholder="e.g. 42 Oak Lane, Whetstone, London N20 9AB"
          required
          value={form?.address ?? ''}
        />

        <div class="space-y-1">
          <label for="totalBudget" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Total Budget <span class="font-normal text-zinc-400">(optional)</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 dark:text-zinc-500">£</span>
            <input
              id="totalBudget"
              name="totalBudget"
              type="text"
              inputmode="numeric"
              placeholder="e.g. 350000"
              value={form?.totalBudget ?? ''}
              class="block w-full rounded-md border border-zinc-200 bg-white pl-7 pr-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <p class="text-xs text-zinc-400 dark:text-zinc-500">You can update this later. We'll create budget categories for you.</p>
        </div>

        <Input
          label="Target Completion Date"
          name="targetCompletion"
          type="date"
          value={form?.targetCompletion ?? ''}
        />

        <div class="pt-2">
          <Button type="submit" size="lg" class="w-full" disabled={submitting}>
            {#if submitting}
              Setting up...
            {:else}
              Let's Build
              <ArrowRight size={18} />
            {/if}
          </Button>
        </div>
      </form>
    </Card>

    <p class="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
      We'll pre-populate your project with a standard UK self-build timeline, building control inspection stages, and budget categories. You can customise everything later.
    </p>
  </div>
</div>

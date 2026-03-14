<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import Camera from 'lucide-svelte/icons/camera';

  let { form } = $props();

  let selectedSeverity = $state('minor');

  const roomOptions = [
    { value: '', label: 'Select room...' },
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'Bathroom', label: 'Bathroom' },
    { value: 'En-suite', label: 'En-suite' },
    { value: 'Living Room', label: 'Living Room' },
    { value: 'Bedroom 1', label: 'Bedroom 1' },
    { value: 'Bedroom 2', label: 'Bedroom 2' },
    { value: 'Bedroom 3', label: 'Bedroom 3' },
    { value: 'Hallway', label: 'Hallway' },
    { value: 'Landing', label: 'Landing' },
    { value: 'Garage', label: 'Garage' },
    { value: 'Utility', label: 'Utility' },
    { value: 'Garden', label: 'Garden' },
    { value: 'Exterior', label: 'Exterior' },
    { value: 'Other', label: 'Other' },
  ];
</script>

<div class="mx-auto max-w-lg space-y-6">
  <!-- Back link -->
  <a href="/snags" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
    <ArrowLeft size={16} />
    Back to Snags
  </a>

  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Report a Snag</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Quick-capture a defect or issue</p>
  </div>

  <form method="POST" enctype="multipart/form-data" use:enhance class="space-y-5">
    <!-- Title - large input for mobile -->
    <Input label="What's the issue?" name="title" required placeholder="e.g. Cracked tile behind the toilet" />

    <!-- Room - large touch target -->
    <Select label="Room" name="room" options={roomOptions} />

    <!-- Severity buttons - large for mobile -->
    <div>
      <p class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">How bad is it?</p>
      <div class="grid grid-cols-3 gap-3">
        <button
          type="button"
          onclick={() => (selectedSeverity = 'critical')}
          class="rounded-md border-2 px-4 py-4 text-center text-sm font-semibold transition-colors {selectedSeverity === 'critical'
            ? 'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950 dark:text-red-400'
            : 'border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-600'}"
        >
          <div class="mb-1 text-2xl">!</div>
          Critical
        </button>
        <button
          type="button"
          onclick={() => (selectedSeverity = 'major')}
          class="rounded-md border-2 px-4 py-4 text-center text-sm font-semibold transition-colors {selectedSeverity === 'major'
            ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400'
            : 'border-zinc-200 text-zinc-600 hover:border-amber-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-amber-600'}"
        >
          <div class="mb-1 text-2xl">!!</div>
          Major
        </button>
        <button
          type="button"
          onclick={() => (selectedSeverity = 'minor')}
          class="rounded-md border-2 px-4 py-4 text-center text-sm font-semibold transition-colors {selectedSeverity === 'minor'
            ? 'border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
            : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500'}"
        >
          <div class="mb-1 text-2xl">-</div>
          Minor
        </button>
      </div>
      <input type="hidden" name="severity" value={selectedSeverity} />
    </div>

    <!-- Description -->
    <Textarea label="Description" name="description" placeholder="Any extra details..." rows={3} />

    <!-- Photo -->
    <div>
      <div class="mb-2 flex items-center gap-1.5">
        <Camera size={14} class="text-zinc-500" />
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Photo</p>
      </div>
      <FileUpload name="photo" accept=".jpg,.jpeg,.png,.heic,.webp" maxSizeMb={10} />
    </div>

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <!-- Large submit button for mobile -->
    <Button type="submit" class="w-full" size="lg">
      Report Snag
    </Button>
  </form>
</div>

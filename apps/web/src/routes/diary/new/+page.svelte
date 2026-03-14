<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import ArrowLeft from 'lucide-svelte/icons/arrow-left';
  import Sun from 'lucide-svelte/icons/sun';
  import Cloud from 'lucide-svelte/icons/cloud';
  import CloudRain from 'lucide-svelte/icons/cloud-rain';
  import Wind from 'lucide-svelte/icons/wind';
  import Snowflake from 'lucide-svelte/icons/snowflake';
  import Thermometer from 'lucide-svelte/icons/thermometer';

  let { form } = $props();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let selectedDate = $state(todayStr);

  const weatherOptions = [
    { value: '', label: 'Select weather...' },
    { value: 'Sunny', label: 'Sunny' },
    { value: 'Cloudy', label: 'Cloudy' },
    { value: 'Rainy', label: 'Rainy' },
    { value: 'Windy', label: 'Windy' },
    { value: 'Cold', label: 'Cold' },
    { value: 'Hot', label: 'Hot' },
  ];

  const weatherIcons: Record<string, typeof Sun> = {
    Sunny: Sun,
    Cloudy: Cloud,
    Rainy: CloudRain,
    Windy: Wind,
    Cold: Snowflake,
    Hot: Thermometer,
  };

  const workers = ['Builder', 'Electrician', 'Plumber', 'Roofer', 'Plasterer', 'Painter', 'Landscaper', 'Other'];

  let selectedWeather = $state('');
  let hasConcealedWorks = $state(false);
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/diary" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
    <ArrowLeft size={16} />
    Back to Diary
  </a>

  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">New Diary Entry</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Quick log of today's build activity</p>
  </div>

  <form method="POST" use:enhance class="space-y-6">
    <!-- Date -->
    <Card>
      <Input label="Date" name="date" type="date" bind:value={selectedDate} required />
    </Card>

    <!-- Weather -->
    <Card>
      <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Weather</h2>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {#each Object.entries(weatherIcons) as [name, Icon]}
          <button
            type="button"
            onclick={() => (selectedWeather = selectedWeather === name ? '' : name)}
            class="flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs transition-colors {selectedWeather === name
              ? 'border-accent-400 bg-accent-50 text-accent-700 dark:border-accent-600 dark:bg-accent-950 dark:text-accent-400'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'}"
          >
            <Icon size={20} />
            {name}
          </button>
        {/each}
      </div>
      <input type="hidden" name="weather" value={selectedWeather} />
    </Card>

    <!-- Who was on site -->
    <Card>
      <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Who was on site?</h2>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {#each workers as worker}
          <label class="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 has-[:checked]:border-accent-400 has-[:checked]:bg-accent-50 has-[:checked]:text-accent-700 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:has-[:checked]:border-accent-600 dark:has-[:checked]:bg-accent-950 dark:has-[:checked]:text-accent-400">
            <input
              type="checkbox"
              name="worker_{worker}"
              class="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
            />
            {worker}
          </label>
        {/each}
      </div>
    </Card>

    <!-- Progress -->
    <Card>
      <Input label="Progress" name="progress" placeholder="What happened today? (one line summary)" />
    </Card>

    <!-- Notes -->
    <Card>
      <Textarea label="Detailed Notes" name="notes" placeholder="Any additional details, measurements, issues..." rows={4} />
    </Card>

    <!-- Concealed works -->
    <Card>
      <label class="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          bind:checked={hasConcealedWorks}
          class="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
        />
        <input type="hidden" name="hasConcealedWorks" value={hasConcealedWorks ? 'true' : 'false'} />
        <div>
          <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Concealed works today</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Pipes, wiring, insulation or other work that will be hidden</p>
        </div>
      </label>
    </Card>

    <!-- Photo area -->
    <Card>
      <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Photos</h2>
      <FileUpload name="photos" accept=".jpg,.jpeg,.png,.heic,.webp" maxSizeMb={10} />
      <p class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">You can add more photos after saving the entry</p>
    </Card>

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <!-- Submit -->
    <div class="flex justify-end gap-3">
      <a href="/diary">
        <Button variant="secondary" type="button">Cancel</Button>
      </a>
      <Button type="submit">Save Entry</Button>
    </div>
  </form>
</div>

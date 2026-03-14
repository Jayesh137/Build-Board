<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import {
    ArrowLeft,
    Pencil,
    Sun,
    Cloud,
    CloudRain,
    Wind,
    Snowflake,
    Thermometer,
    Camera,
    AlertTriangle,
  } from 'lucide-svelte';

  interface DiaryEntry {
    id: string;
    date: string;
    weather: string | null;
    workersOnSite: string[];
    progress: string | null;
    notes: string | null;
    hasConcealedWorks: boolean;
  }

  interface Photo {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
    room: string | null;
    createdAt: string;
  }

  let { data, form } = $props();

  const entry: DiaryEntry | null = data.entry;
  const photos: Photo[] = data.photos ?? [];
  const dateParam: string = data.date;

  let editing = $state(false);
  let selectedWeather = $state(entry?.weather ?? '');
  let hasConcealedWorks = $state(entry?.hasConcealedWorks ?? false);

  const weatherIcons: Record<string, typeof Sun> = {
    Sunny: Sun,
    Cloudy: Cloud,
    Rainy: CloudRain,
    Windy: Wind,
    Cold: Snowflake,
    Hot: Thermometer,
  };

  const workers = ['Builder', 'Electrician', 'Plumber', 'Roofer', 'Plasterer', 'Painter', 'Landscaper', 'Other'];

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function getWeatherIcon(weather: string | null) {
    if (!weather || !weatherIcons[weather]) return Cloud;
    return weatherIcons[weather];
  }
</script>

<div class="space-y-6">
  <!-- Back link -->
  <a href="/diary" class="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
    <ArrowLeft size={16} />
    Back to Diary
  </a>

  {#if !entry}
    <Card>
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No entry for {formatDate(dateParam)}</p>
        <div class="mt-4">
          <a href="/diary/new">
            <Button size="sm">Create Entry</Button>
          </a>
        </div>
      </div>
    </Card>
  {:else}
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(entry.date)}</h1>
        <div class="mt-2 flex items-center gap-2">
          {#if entry.weather}
            {@const WeatherIcon = getWeatherIcon(entry.weather)}
            <Badge variant="info" size="sm">
              <WeatherIcon size={12} />
              {entry.weather}
            </Badge>
          {/if}
          {#if entry.hasConcealedWorks}
            <Badge variant="warning" size="sm">
              <AlertTriangle size={12} />
              Concealed Works
            </Badge>
          {/if}
        </div>
      </div>
      <Button variant="secondary" size="sm" onclick={() => (editing = !editing)}>
        <Pencil size={14} />
        {editing ? 'Cancel' : 'Edit'}
      </Button>
    </div>

    {#if editing}
      <!-- Edit form -->
      <form method="POST" action="?/update" use:enhance class="space-y-6">
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

        <!-- Workers -->
        <Card>
          <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Who was on site?</h2>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {#each workers as worker}
              <label class="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 has-[:checked]:border-accent-400 has-[:checked]:bg-accent-50 has-[:checked]:text-accent-700 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:has-[:checked]:border-accent-600 dark:has-[:checked]:bg-accent-950 dark:has-[:checked]:text-accent-400">
                <input
                  type="checkbox"
                  name="worker_{worker}"
                  checked={entry.workersOnSite.includes(worker)}
                  class="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
                />
                {worker}
              </label>
            {/each}
          </div>
        </Card>

        <Card>
          <Input label="Progress" name="progress" value={entry.progress ?? ''} placeholder="What happened today?" />
        </Card>

        <Card>
          <Textarea label="Notes" name="notes" value={entry.notes ?? ''} rows={4} />
        </Card>

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

        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}

        <div class="flex justify-end gap-3">
          <Button variant="secondary" type="button" onclick={() => (editing = false)}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    {:else}
      <!-- Read-only view -->
      {#if entry.workersOnSite.length > 0}
        <Card>
          <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">On Site</h2>
          <div class="flex flex-wrap gap-2">
            {#each entry.workersOnSite as worker}
              <Badge variant="info" size="sm">{worker}</Badge>
            {/each}
          </div>
        </Card>
      {/if}

      {#if entry.progress}
        <Card>
          <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Progress</h2>
          <p class="text-sm text-zinc-600 dark:text-zinc-400">{entry.progress}</p>
        </Card>
      {/if}

      {#if entry.notes}
        <Card>
          <h2 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notes</h2>
          <p class="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{entry.notes}</p>
        </Card>
      {/if}

      <!-- Photo gallery -->
      <div>
        <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Photos ({photos.length})
        </h2>
        {#if photos.length === 0}
          <Card>
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <Camera size={24} class="mb-2 text-zinc-300 dark:text-zinc-600" />
              <p class="text-sm text-zinc-500 dark:text-zinc-400">No photos for this day</p>
            </div>
          </Card>
        {:else}
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {#each photos as photo}
              <a href={photo.url} target="_blank" rel="noopener noreferrer" class="group">
                <div class="aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.caption || 'Site photo'}
                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                {#if photo.caption}
                  <p class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{photo.caption}</p>
                {/if}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    Plus,
    BookOpen,
    Flame,
    Clock,
    ChevronLeft,
    ChevronRight,
    Sun,
    Cloud,
    CloudRain,
    Wind,
    Snowflake,
    Thermometer,
    AlertTriangle,
  } from 'lucide-svelte';

  interface DiaryEntry {
    id: string;
    date: string;
    weather: string | null;
    workersOnSite: string[];
    progress: string | null;
    notes: string | null;
    photoCount: number;
    hasConcealedWorks: boolean;
  }

  interface Streak {
    currentStreak: number;
    lastEntryDate: string | null;
  }

  let { data } = $props();

  const entries: DiaryEntry[] = data.entries ?? [];
  const streak: Streak | null = data.streak;

  const today = new Date();
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function prevMonth() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  // Build calendar grid
  const calendarDays = $derived(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: { date: number; inMonth: boolean; dateStr: string; hasEntry: boolean; isToday: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = viewMonth === 0 ? 12 : viewMonth;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, inMonth: false, dateStr, hasEntry: false, isToday: false });
    }

    // Current month
    const entryDates = new Set(entries.map((e) => e.date));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: d,
        inMonth: true,
        dateStr,
        hasEntry: entryDates.has(dateStr),
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 1 : viewMonth + 2;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, inMonth: false, dateStr, hasEntry: false, isToday: false });
    }

    return days;
  });

  const recentEntries = $derived(
    [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
  );

  const hasConcealedWorks = $derived(entries.some((e) => e.hasConcealedWorks));

  function getWeatherIcon(weather: string | null) {
    switch (weather) {
      case 'Sunny': return Sun;
      case 'Cloudy': return Cloud;
      case 'Rainy': return CloudRain;
      case 'Windy': return Wind;
      case 'Cold': return Snowflake;
      case 'Hot': return Thermometer;
      default: return Cloud;
    }
  }

  function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function lastEntryLabel(dateStr: string | null): string {
    if (!dateStr) return 'No entries yet';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long' });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const hasTodayEntry = $derived(entries.some((e) => e.date === todayStr));
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Site Diary</h1>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} recorded
      </p>
    </div>
    <a href={hasTodayEntry ? `/diary/${todayStr}` : '/diary/new'}>
      <Button size="sm">
        <Plus size={16} />
        {hasTodayEntry ? "Today's Entry" : 'New Entry'}
      </Button>
    </a>
  </div>

  <!-- Streak and concealed works -->
  <div class="grid gap-4 sm:grid-cols-2">
    <!-- Streak -->
    <Card>
      <div class="flex items-center gap-3">
        {#if streak && streak.currentStreak > 0}
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30">
            <Flame size={20} class="text-orange-500" />
          </div>
          <div>
            <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {streak.currentStreak}-day streak
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Keep it going!</p>
          </div>
        {:else}
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
            <Clock size={20} class="text-zinc-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Last entry: {lastEntryLabel(streak?.lastEntryDate ?? null)}
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Log today to start a streak</p>
          </div>
        {/if}
      </div>
    </Card>

    <!-- Concealed works banner -->
    {#if hasConcealedWorks}
      <Card class="border-amber-200 dark:border-amber-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle size={20} class="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">Concealed Works Logged</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Photos of concealed works are important for warranty
            </p>
          </div>
        </div>
      </Card>
    {/if}
  </div>

  <!-- Calendar -->
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <button
        onclick={prevMonth}
        class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={18} />
      </button>
      <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {monthNames[viewMonth]} {viewYear}
      </h2>
      <button
        onclick={nextMonth}
        class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <ChevronRight size={18} />
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 gap-px">
      {#each dayNames as day}
        <div class="pb-2 text-center text-xs font-medium text-zinc-400">{day}</div>
      {/each}
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-px">
      {#each calendarDays() as day}
        {#if day.inMonth && day.hasEntry}
          <a
            href="/diary/{day.dateStr}"
            class="relative flex h-10 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent-50 dark:hover:bg-accent-950 {day.isToday ? 'font-semibold text-accent-600 dark:text-accent-400' : 'text-zinc-900 dark:text-zinc-100'}"
          >
            {day.date}
            <span class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-accent-500"></span>
          </a>
        {:else}
          <div
            class="flex h-10 items-center justify-center rounded-md text-sm {day.inMonth
              ? day.isToday
                ? 'font-semibold text-accent-600 dark:text-accent-400'
                : 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-300 dark:text-zinc-600'}"
          >
            {day.date}
          </div>
        {/if}
      {/each}
    </div>
  </Card>

  <!-- Recent entries -->
  <div>
    <h2 class="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Entries</h2>
    {#if recentEntries.length === 0}
      <Card>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <BookOpen size={32} class="mb-2 text-zinc-300 dark:text-zinc-600" />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No diary entries yet</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Start logging your build progress daily</p>
        </div>
      </Card>
    {:else}
      <Card padding="compact">
        <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
          {#each recentEntries as entry}
            {@const WeatherIcon = getWeatherIcon(entry.weather)}
            <a
              href="/diary/{entry.date}"
              class="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                <WeatherIcon size={16} class="text-zinc-500 dark:text-zinc-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">{formatDate(entry.date)}</p>
                {#if entry.progress}
                  <p class="truncate text-xs text-zinc-500 dark:text-zinc-400">{entry.progress}</p>
                {/if}
              </div>
              <div class="flex flex-shrink-0 items-center gap-2">
                {#if entry.workersOnSite.length > 0}
                  <Badge variant="info" size="sm">{entry.workersOnSite.length} on site</Badge>
                {/if}
                {#if entry.photoCount > 0}
                  <Badge variant="not_started" size="sm">{entry.photoCount} photos</Badge>
                {/if}
                {#if entry.hasConcealedWorks}
                  <Badge variant="warning" size="sm">Concealed</Badge>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</div>

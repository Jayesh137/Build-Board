<script lang="ts">
  import Plus from 'lucide-svelte/icons/plus';
  import BookOpen from 'lucide-svelte/icons/book-open';
  import Flame from 'lucide-svelte/icons/flame';
  import Clock from 'lucide-svelte/icons/clock';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import Sun from 'lucide-svelte/icons/sun';
  import Cloud from 'lucide-svelte/icons/cloud';
  import CloudRain from 'lucide-svelte/icons/cloud-rain';
  import Wind from 'lucide-svelte/icons/wind';
  import Snowflake from 'lucide-svelte/icons/snowflake';
  import Thermometer from 'lucide-svelte/icons/thermometer';
  import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
  import Camera from 'lucide-svelte/icons/camera';
  import Users from 'lucide-svelte/icons/users';
  import Eye from 'lucide-svelte/icons/eye';
  import ImageIcon from 'lucide-svelte/icons/image';
  import Compass from 'lucide-svelte/icons/compass';
  import XIcon from 'lucide-svelte/icons/x';

  interface DiaryEntry {
    id: string;
    date: string;
    weather: string | null;
    temperature?: number | null;
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
  const currentPhase: string | null = data.currentPhase ?? null;

  // Feature A: "What's Next" dismissable
  let whatsNextDismissed = $state(false);

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

  const calendarDays = $derived(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: { date: number; inMonth: boolean; dateStr: string; hasEntry: boolean; isToday: boolean }[] = [];

    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = viewMonth === 0 ? 12 : viewMonth;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: d, inMonth: false, dateStr, hasEntry: false, isToday: false });
    }

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

  const isFirstFix = $derived(
    currentPhase === 'first_fix' || currentPhase === 'firstFix'
  );

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

  function formatLastEntry(dateStr: string | null): string {
    if (!dateStr) return 'No entries yet';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const hasTodayEntry = $derived(entries.some((e) => e.date === todayStr));
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Site Diary</h1>
        {#if streak && streak.currentStreak > 0}
          <span class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/15 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 ring-1 ring-orange-200/50 dark:ring-orange-800/40">
            <Flame size={13} class="text-orange-500" />
            {streak.currentStreak}-day streak
          </span>
        {:else}
          <span class="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Clock size={12} />
            Last entry: {formatLastEntry(streak?.lastEntryDate ?? null)}
          </span>
        {/if}
      </div>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} recorded
      </p>
    </div>

    <a
      href={hasTodayEntry ? `/diary/${todayStr}` : '/diary/new'}
      class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-600 text-white h-9 px-3.5 text-sm font-medium transition-colors hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600"
    >
      <Plus size={15} />
      {hasTodayEntry ? "Today's Entry" : 'New Entry'}
    </a>
  </div>

  <!-- Feature A: What's Next prompt -->
  {#if !whatsNextDismissed}
    <div class="flex items-start gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 py-3 px-4">
      <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-700/60">
        <Compass size={14} class="text-zinc-500 dark:text-zinc-400" />
      </div>
      <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        A daily photo and one line keeps your build diary alive. It's invaluable for disputes, warranties, and memories.
      </p>
      <button
        onclick={() => (whatsNextDismissed = true)}
        class="flex-shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
      >
        <XIcon size={14} />
      </button>
    </div>
  {/if}

  <!-- Concealed works banner (first fix phase) -->
  {#if isFirstFix}
    <div class="rounded-xl border border-amber-200/50 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 shadow-sm border-l-4 border-l-amber-400 dark:border-l-amber-500">
      <div class="flex items-start gap-3 p-4">
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Camera size={18} class="text-amber-600 dark:text-amber-400" />
        </div>
        <div class="pt-0.5">
          <p class="text-sm font-medium text-amber-900 dark:text-amber-200">Concealed Works Reminder</p>
          <p class="mt-0.5 text-sm text-amber-700 dark:text-amber-400/80">
            Remember to photograph all pipes, wires, and insulation <span class="font-semibold">before</span> they are covered.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Calendar -->
  <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.25)] p-4 lg:p-5">
    <p class="mb-4 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Calendar</p>

    <!-- Month nav -->
    <div class="mb-4 flex items-center justify-between">
      <button
        onclick={prevMonth}
        class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <ChevronLeft size={16} />
      </button>
      <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {monthNames[viewMonth]} {viewYear}
      </h2>
      <button
        onclick={nextMonth}
        class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <ChevronRight size={16} />
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 gap-px mb-1">
      {#each dayNames as day}
        <div class="pb-2 text-center text-[11px] uppercase tracking-wider text-zinc-400 font-medium">{day}</div>
      {/each}
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-px">
      {#each calendarDays() as day}
        {#if day.inMonth && day.hasEntry}
          <a
            href="/diary/{day.dateStr}"
            class="relative flex h-10 items-center justify-center rounded-lg text-sm transition-all hover:bg-accent-50 dark:hover:bg-accent-950 {day.isToday ? 'ring-2 ring-accent-500/50 font-semibold text-accent-600 dark:text-accent-400' : 'text-zinc-900 dark:text-zinc-100'}"
          >
            {day.date}
            <span class="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-accent-500"></span>
          </a>
        {:else}
          <div
            class="flex h-10 items-center justify-center rounded-lg text-sm {day.inMonth
              ? day.isToday
                ? 'ring-2 ring-accent-500/50 font-semibold text-accent-600 dark:text-accent-400'
                : 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-300 dark:text-zinc-600'}"
          >
            {day.date}
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Recent entries -->
  <div>
    <p class="mb-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Recent Entries</p>

    {#if recentEntries.length === 0}
      <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <BookOpen size={24} class="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p class="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No diary entries yet</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Start logging your build progress daily
          </p>
        </div>
      </div>
    {:else}
      <div class="space-y-2">
        {#each recentEntries as entry}
          {@const WeatherIcon = getWeatherIcon(entry.weather)}
          <a
            href="/diary/{entry.date}"
            class="group flex items-center gap-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] p-4 transition-all duration-200 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:border-zinc-300/60 dark:hover:border-zinc-700/60"
          >
            <!-- Weather icon -->
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <WeatherIcon size={18} class="text-zinc-500 dark:text-zinc-400" />
            </div>

            <!-- Entry content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(entry.date)}</p>
                {#if entry.temperature != null}
                  <span class="text-xs text-zinc-400">{entry.temperature}&deg;C</span>
                {/if}
              </div>
              {#if entry.progress}
                <p class="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">{entry.progress}</p>
              {/if}
            </div>

            <!-- Badges -->
            <div class="flex flex-shrink-0 items-center gap-2">
              {#if entry.workersOnSite.length > 0}
                <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  <Users size={11} />
                  {entry.workersOnSite.length}
                </span>
              {/if}
              {#if entry.photoCount > 0}
                <span class="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <ImageIcon size={11} />
                  {entry.photoCount}
                </span>
              {/if}
              {#if entry.hasConcealedWorks}
                <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <Eye size={11} />
                  Concealed
                </span>
              {/if}
              <ChevronRight size={16} class="text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>

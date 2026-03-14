<script lang="ts">
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import ChevronDown from 'lucide-svelte/icons/chevron-down';

  import ExternalLink from 'lucide-svelte/icons/external-link';
  import Calendar from 'lucide-svelte/icons/calendar';
  import Lightbulb from 'lucide-svelte/icons/lightbulb';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import FileCheck from 'lucide-svelte/icons/file-check';
  import CircleCheck from 'lucide-svelte/icons/circle-check';

  interface Inspection {
    id: string;
    name: string;
    type: 'building_control' | 'warranty' | 'other';
    linkedTaskId: string | null;
    linkedTaskTitle?: string | null;
    status: 'not_needed' | 'due' | 'booked' | 'passed' | 'conditional' | 'failed';
    scheduledDate: string | null;
    sortOrder: number;
  }

  interface InspectionGuide {
    checks: string[];
    prepare: string[];
    failReasons: string[];
    tip: string;
  }

  let { data } = $props();

  const inspections: Inspection[] = data.inspections ?? [];

  // Track which inspection guides are expanded
  let expandedGuides = $state<Set<string>>(new Set());

  function toggleGuide(inspectionId: string, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = new Set(expandedGuides);
    if (next.has(inspectionId)) {
      next.delete(inspectionId);
    } else {
      next.add(inspectionId);
    }
    expandedGuides = next;
  }

  const inspectionGuides: Record<string, InspectionGuide> = {
    'Commencement notification': {
      checks: ['Building control has been notified of start date', 'All pre-commencement conditions discharged'],
      prepare: ['Have your approved plans on site', 'Confirm your building control reference number'],
      failReasons: ['Starting without notification (48 hours notice required)'],
      tip: 'Call Barnet Building Control on 020 8359 4500 to confirm they have your notification.',
    },
    'Excavation inspection': {
      checks: ['Trench depth matches structural engineer\'s design', 'Trench width is adequate', 'Ground conditions match soil survey', 'No water ingress in trenches'],
      prepare: ['Have structural engineer\'s foundation drawings on site', 'Ensure trenches are clean and accessible', 'Have a tape measure ready'],
      failReasons: ['Trenches not deep enough for soil type', 'Ground conditions differ from survey (may need redesign)', 'Water in trenches'],
      tip: 'If ground conditions surprise you, don\'t pour concrete. Call your structural engineer first.',
    },
    'Foundation concrete': {
      checks: ['Concrete mix specification matches design', 'Reinforcement (if required) correctly placed', 'Trench is clean before pour', 'Concrete depth adequate'],
      prepare: ['Confirm concrete mix with your engineer', 'Have approved drawings on site', 'Ensure pump/mixer access is clear'],
      failReasons: ['Wrong concrete mix', 'Inadequate cover to reinforcement', 'Contaminated trench bottom'],
      tip: 'Take photos during the pour - you can never go back and check once it\'s set.',
    },
    'Drainage inspection': {
      checks: ['Pipe falls are correct (minimum 1:40 for 100mm)', 'Joints are properly sealed', 'Manholes correctly bedded', 'No debris in pipes'],
      prepare: ['Have drainage layout drawing available', 'Ensure all pipes are visible and accessible', 'Have water available for testing'],
      failReasons: ['Incorrect pipe falls', 'Leaking joints', 'Pipes not properly bedded'],
      tip: 'Drainage MUST be inspected before being covered. Missing this means digging it up later.',
    },
    'Oversite / DPM': {
      checks: ['DPM (damp-proof membrane) correctly lapped and sealed', 'Insulation thickness matches specification', 'No punctures or damage to membrane'],
      prepare: ['Ensure DPM is clean and visible', 'Have specification documents ready', 'Check for any service penetrations that need sealing'],
      failReasons: ['Inadequate DPM laps (minimum 150mm)', 'Damaged or punctured membrane', 'Wrong insulation thickness'],
      tip: 'Walk the entire DPM surface carefully before the pour and patch any punctures with DPM tape.',
    },
    'Pre-plaster': {
      checks: ['Electrical wiring correctly installed', 'Plumbing properly clipped and tested', 'Fire stopping complete at all penetrations', 'Insulation correctly fitted with no gaps', 'Ventilation ducts in place'],
      prepare: ['All first fix trades must be complete', 'Fire stopping visible and accessible', 'Have Part P electrical certificate if applicable'],
      failReasons: ['Incomplete fire stopping', 'Gaps in insulation', 'Electrical not to current regulations', 'Missing ventilation provisions'],
      tip: 'This is your LAST chance to photograph concealed services. Once plasterboard goes on, everything is hidden forever.',
    },
    'Structural steelwork': {
      checks: ['Steel sizes match structural engineer\'s drawings', 'Connections and fixings correct', 'Fire protection applied where required', 'Padstones correctly positioned'],
      prepare: ['Have structural engineer\'s drawings on site', 'Ensure all steelwork is accessible for inspection', 'Check weld quality if applicable'],
      failReasons: ['Wrong steel sizes', 'Incorrect connections', 'Missing fire protection', 'Inadequate bearing on padstones'],
      tip: 'Ask your structural engineer to do a site visit for steelwork - the fee is small compared to getting it wrong.',
    },
    'Roof structure': {
      checks: ['Truss layout matches engineer\'s design', 'Bracing installed correctly', 'Strapping to walls adequate', 'Roof ventilation provisions in place'],
      prepare: ['Have truss layout drawing available', 'Ensure all trusses are visible and accessible', 'Check temporary bracing is still in place'],
      failReasons: ['Wrong truss spacing', 'Inadequate bracing', 'Missing straps to walls', 'No provision for ventilation'],
      tip: 'Check the engineer\'s drawing for any special trusses (girder, valley, hip) - they are NOT interchangeable.',
    },
    'Final inspection': {
      checks: ['All certificates collected (electrical, gas, EPC)', 'Air tightness test passed', 'All previous inspection items resolved', 'Safety glazing where required', 'Smoke and heat alarms installed and tested'],
      prepare: ['Compile all certificates in one folder', 'Ensure air tightness test report is available', 'Have all previous inspection reports ready', 'Test all smoke/heat alarms'],
      failReasons: ['Missing certificates', 'Outstanding items from previous inspections', 'Smoke alarms not installed or not working', 'Safety glazing missing in critical locations'],
      tip: 'Create a completion file with every certificate, test result, and warranty. You only get one chance at the completion certificate.',
    },
  };

  const defaultGuide: InspectionGuide = {
    checks: ['All work complies with approved drawings', 'Materials match specification', 'Workmanship quality is acceptable'],
    prepare: ['Have approved drawings on site', 'Ensure work area is clean and accessible', 'Have relevant certificates ready'],
    failReasons: ['Work does not match approved drawings', 'Materials not as specified', 'Poor workmanship quality'],
    tip: 'Always have your approved plans and building control reference number available during any inspection.',
  };

  function getGuide(name: string): InspectionGuide {
    // Try exact match first
    if (inspectionGuides[name]) return inspectionGuides[name];

    // Try fuzzy match
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(inspectionGuides)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return value;
      }
    }

    return defaultGuide;
  }

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    not_needed: {
      label: 'Not Needed',
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-600 dark:text-zinc-400',
      border: 'border-l-zinc-300 dark:border-l-zinc-600',
      dot: 'bg-zinc-400',
    },
    due: {
      label: 'Due',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-l-amber-400 dark:border-l-amber-500',
      dot: 'bg-amber-500',
    },
    booked: {
      label: 'Booked',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-l-blue-400 dark:border-l-blue-500',
      dot: 'bg-blue-500',
    },
    passed: {
      label: 'Passed',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-l-green-500 dark:border-l-green-500',
      dot: 'bg-green-500',
    },
    conditional: {
      label: 'Conditional',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-l-amber-400 dark:border-l-amber-500',
      dot: 'bg-amber-500',
    },
    failed: {
      label: 'Failed',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-l-red-500 dark:border-l-red-500',
      dot: 'bg-red-500',
    },
  };

  const typeConfig: Record<string, { label: string; classes: string }> = {
    building_control: {
      label: 'Building Control',
      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-200/50 dark:ring-blue-800/50',
    },
    warranty: {
      label: 'Warranty',
      classes: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 ring-1 ring-purple-200/50 dark:ring-purple-800/50',
    },
    other: {
      label: 'Other',
      classes: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50',
    },
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Inspections</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
      {inspections.length} inspection{inspections.length !== 1 ? 's' : ''} tracked
    </p>
  </div>

  <!-- Info banner -->
  <div class="rounded-xl border border-blue-200/40 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/15 shadow-sm">
    <div class="flex items-start gap-3 p-4 lg:p-5">
      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100/80 dark:bg-blue-900/30">
        <ClipboardCheck size={18} class="text-blue-600 dark:text-blue-400" />
      </div>
      <div class="min-w-0 pt-0.5">
        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Booking tip</p>
        <p class="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Building Control inspections can be booked same-day &mdash; call before 10am for a visit that afternoon. Click any inspection to see its preparation guide.
        </p>
      </div>
    </div>
  </div>

  <!-- Inspections list -->
  {#if inspections.length === 0}
    <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm">
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <ClipboardCheck size={24} class="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p class="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No inspections yet</p>
        <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Inspections will appear as your build progresses
        </p>
      </div>
    </div>
  {:else}
    <div>
      <p class="mb-3 text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Inspection Schedule</p>

      <div class="space-y-2">
        {#each inspections as inspection}
          {@const status = statusConfig[inspection.status] ?? statusConfig.not_needed}
          {@const type = typeConfig[inspection.type] ?? typeConfig.other}
          {@const isGuideOpen = expandedGuides.has(inspection.id)}
          {@const guide = getGuide(inspection.name)}
          <div class="rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.2)] border-l-4 {status.border} transition-all duration-200 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] overflow-hidden">
            <!-- Inspection row -->
            <div
              class="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              role="button"
              tabindex="0"
              onclick={(e) => toggleGuide(inspection.id, e)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGuide(inspection.id, e as unknown as MouseEvent); } }}
            >
              <!-- Main content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3 flex-wrap">
                  <p class="font-medium text-zinc-900 dark:text-zinc-100">{inspection.name}</p>
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {type.classes}">
                    {type.label}
                  </span>
                </div>

                <div class="mt-1.5 flex items-center gap-4 text-sm">
                  {#if inspection.linkedTaskId}
                    <a
                      href="/timeline/{inspection.linkedTaskId}"
                      class="inline-flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline"
                      onclick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      <span class="truncate max-w-[200px]">{inspection.linkedTaskTitle ?? 'Linked task'}</span>
                    </a>
                  {/if}

                  {#if inspection.scheduledDate}
                    <span class="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Calendar size={12} />
                      {formatDate(inspection.scheduledDate)}
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Status badge + expand indicator -->
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium {status.bg} {status.text}">
                  <span class="h-1.5 w-1.5 rounded-full {status.dot}"></span>
                  {status.label}
                </span>
                <span
                  class="transition-transform duration-200 text-zinc-300 dark:text-zinc-600"
                  class:rotate-180={isGuideOpen}
                >
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>

            <!-- Preparation Guide (expandable) -->
            {#if isGuideOpen}
              <div class="border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-800/10">
                <div class="p-4 lg:p-5 space-y-4">
                  <p class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Preparation Guide</p>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <!-- What they check -->
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <ClipboardCheck size={14} class="text-blue-500" />
                        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">What they check</span>
                      </div>
                      <ul class="space-y-1.5 pl-0.5">
                        {#each guide.checks as check}
                          <li class="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <CircleCheck size={13} class="mt-0.5 text-blue-400 dark:text-blue-500 flex-shrink-0" />
                            <span>{check}</span>
                          </li>
                        {/each}
                      </ul>
                    </div>

                    <!-- How to prepare -->
                    <div class="space-y-2">
                      <div class="flex items-center gap-2">
                        <FileCheck size={14} class="text-emerald-500" />
                        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">How to prepare</span>
                      </div>
                      <ul class="space-y-1.5 pl-0.5">
                        {#each guide.prepare as item}
                          <li class="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <CircleCheck size={13} class="mt-0.5 text-emerald-400 dark:text-emerald-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  </div>

                  <!-- Common fail reasons -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <AlertTriangle size={14} class="text-red-400" />
                      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Common fail reasons</span>
                    </div>
                    <div class="space-y-1.5">
                      {#each guide.failReasons as reason}
                        <div class="flex items-start gap-2.5 rounded-lg bg-red-50/60 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20 px-3 py-2">
                          <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                          <span class="text-sm text-red-700 dark:text-red-400">{reason}</span>
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Pro tip -->
                  <div class="rounded-lg bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 px-4 py-3">
                    <div class="flex items-start gap-2.5">
                      <Lightbulb size={15} class="mt-0.5 text-amber-500 flex-shrink-0" />
                      <div>
                        <span class="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-medium">Pro tip</span>
                        <p class="mt-1 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{guide.tip}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Link to detail page -->
                  <div class="pt-1">
                    <a
                      href="/inspections/{inspection.id}"
                      class="inline-flex items-center gap-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 hover:underline"
                      onclick={(e) => e.stopPropagation()}
                    >
                      View full details
                      <ChevronRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

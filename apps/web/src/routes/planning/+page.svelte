<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import FileCheck from 'lucide-svelte/icons/file-check';
  import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
  import Lock from 'lucide-svelte/icons/lock';
  import Check from 'lucide-svelte/icons/check';
  import CircleDot from 'lucide-svelte/icons/circle-dot';
  import ClipboardList from 'lucide-svelte/icons/clipboard-list';
  import Landmark from 'lucide-svelte/icons/landmark';
  import Calendar from 'lucide-svelte/icons/calendar';
  import ShieldCheck from 'lucide-svelte/icons/shield-check';
  import CircleCheck from 'lucide-svelte/icons/circle-check';
  import CircleAlert from 'lucide-svelte/icons/circle-alert';

  interface PlanningStatus {
    reference: string;
    status: string;
    expiryDate: string | null;
    localAuthority: string;
  }

  interface PlanningCondition {
    id: string;
    conditionNumber: number;
    description: string;
    conditionType: 'pre_commencement' | 'pre_occupation' | 'ongoing' | 'informative';
    status: 'not_started' | 'submitted' | 'discharged' | 'partially_discharged';
    submissionDate: string | null;
    decisionDate: string | null;
    notes: string | null;
  }

  interface CILStep {
    id: string;
    stepNumber: number;
    formName: string;
    description: string;
    status: 'not_started' | 'submitted' | 'confirmed' | 'overdue';
    submittedDate: string | null;
    confirmedDate: string | null;
    deadline: string | null;
    isBlocking: boolean;
    notes: string | null;
  }

  let { data } = $props();

  const planningStatus: PlanningStatus | null = data.planningStatus;
  const conditions: PlanningCondition[] = data.conditions ?? [];
  const cilSteps: CILStep[] = data.cilSteps ?? [];

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  function daysUntil(dateStr: string): number {
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    const now = new Date();
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function isExpiringSoon(expiryDate: string): boolean {
    const days = daysUntil(expiryDate);
    return days >= 0 && days <= 90;
  }

  function isExpired(expiryDate: string): boolean {
    return daysUntil(expiryDate) < 0;
  }

  // Condition type styling
  function conditionTypeClasses(type: string): string {
    switch (type) {
      case 'pre_commencement': return 'bg-red-50 text-red-700 ring-1 ring-red-200/50 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800/30';
      case 'pre_occupation': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/30';
      case 'ongoing': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/30';
      case 'informative': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  }

  function conditionTypeLabel(type: string): string {
    switch (type) {
      case 'pre_commencement': return 'Pre-Commencement';
      case 'pre_occupation': return 'Pre-Occupation';
      case 'ongoing': return 'Ongoing';
      case 'informative': return 'Informative';
      default: return type;
    }
  }

  function conditionStatusClasses(status: string): string {
    switch (status) {
      case 'discharged': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'submitted': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'partially_discharged': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'not_started': return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  }

  function conditionStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // CIL commencement check
  const canCommence = $derived(() => {
    const form7Part1 = cilSteps.find((s: CILStep) => s.formName.toLowerCase().includes('form 7 part 1'));
    const form6 = cilSteps.find((s: CILStep) => s.formName.toLowerCase().includes('form 6'));

    if (!form7Part1 || form7Part1.status !== 'confirmed') {
      return { allowed: false, reason: 'Form 7 Part 1 (Self Build Exemption Claim) must be confirmed before commencement' };
    }
    if (!form6 || form6.status !== 'confirmed') {
      return { allowed: false, reason: 'Form 6 (Commencement Notice) must be confirmed before commencement' };
    }
    return { allowed: true, reason: '' };
  });

  // Conditions progress
  const dischargedCount = $derived(conditions.filter((c) => c.status === 'discharged').length);

  // CIL step styling
  function stepCircleBg(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white shadow-[0_0_0_3px_rgba(34,197,94,0.15)]';
      case 'submitted': return 'bg-blue-500 text-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]';
      case 'overdue': return 'bg-red-500 text-white shadow-[0_0_0_3px_rgba(239,68,68,0.15)]';
      default: return 'border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900';
    }
  }

  function stepLineBg(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-400';
      default: return 'bg-zinc-200 dark:bg-zinc-700';
    }
  }
</script>

<div class="space-y-8">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Planning & CIL</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
      Planning permission, conditions, and CIL self-build exemption
    </p>
  </div>

  <!-- Section 1: Planning Status -->
  <section>
    <span class="mb-3 flex items-center gap-2">
      <FileCheck size={13} class="text-indigo-500" />
      <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Planning Permission</span>
    </span>

    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900 overflow-hidden">
      <!-- Accent top border -->
      <div class="h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

      {#if planningStatus}
        <div class="p-5 lg:p-6">
          <div class="grid gap-6 sm:grid-cols-3">
            <!-- Reference -->
            <div>
              <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Reference</span>
              <p class="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                {planningStatus.reference || '--'}
              </p>
            </div>

            <!-- Status -->
            <div>
              <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Status</span>
              <div class="mt-1.5">
                <StatusBadge status={planningStatus.status} size="md" />
              </div>
            </div>

            <!-- Expiry -->
            <div>
              <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Expiry Date</span>
              {#if planningStatus.expiryDate}
                <div class="mt-1.5 flex items-center gap-2">
                  <p class="text-sm font-semibold {isExpired(planningStatus.expiryDate)
                    ? 'text-red-600 dark:text-red-400'
                    : isExpiringSoon(planningStatus.expiryDate)
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-zinc-900 dark:text-zinc-100'}">
                    {formatDate(planningStatus.expiryDate)}
                  </p>
                  {#if isExpired(planningStatus.expiryDate)}
                    <span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      Expired
                    </span>
                  {:else if isExpiringSoon(planningStatus.expiryDate)}
                    <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      {daysUntil(planningStatus.expiryDate)}d left
                    </span>
                  {/if}
                </div>
              {:else}
                <p class="mt-1.5 text-sm text-zinc-400">--</p>
              {/if}
            </div>
          </div>

          {#if planningStatus.localAuthority}
            <div class="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <Landmark size={12} />
              {planningStatus.localAuthority}
            </div>
          {/if}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <FileCheck size={20} class="text-zinc-400" />
          </div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No planning status configured</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Set up your planning reference in project settings</p>
        </div>
      {/if}
    </div>
  </section>

  <!-- Section 2: Planning Conditions -->
  <section>
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <ClipboardList size={13} class="text-indigo-500" />
        <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Planning Conditions</span>
      </div>
      {#if conditions.length > 0}
        <span class="text-xs text-zinc-400 dark:text-zinc-500">
          <span class="font-medium text-green-600 dark:text-green-400">{dischargedCount}</span>
          of {conditions.length} discharged
        </span>
      {/if}
    </div>

    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      {#if conditions.length === 0}
        <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <ClipboardList size={20} class="text-zinc-400" />
          </div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No planning conditions added</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Conditions from your planning approval will appear here</p>
        </div>
      {:else}
        <!-- Progress bar -->
        {#if conditions.length > 0}
          <div class="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800/60">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                class="h-full rounded-full bg-green-500 transition-all duration-500"
                style="width: {conditions.length > 0 ? (dischargedCount / conditions.length) * 100 : 0}%"
              ></div>
            </div>
          </div>
        {/if}

        <!-- Condition items -->
        {#each conditions as condition, i}
          <div class="flex items-start gap-4 px-5 py-4 {i < conditions.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}">
            <!-- Condition number -->
            <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
              {condition.status === 'discharged'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}">
              {#if condition.status === 'discharged'}
                <Check size={14} />
              {:else}
                {condition.conditionNumber}
              {/if}
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">
                {condition.description}
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <!-- Type badge -->
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium {conditionTypeClasses(condition.conditionType)}">
                  {conditionTypeLabel(condition.conditionType)}
                </span>
                <!-- Status badge -->
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium {conditionStatusClasses(condition.status)}">
                  {conditionStatusLabel(condition.status)}
                </span>
                <!-- Dates -->
                {#if condition.submissionDate}
                  <span class="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Calendar size={10} />
                    Submitted {formatDate(condition.submissionDate)}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <!-- Section 3: CIL Self-Build Exemption Workflow -->
  <section>
    <div class="mb-3 flex items-center gap-2">
      <Landmark size={13} class="text-indigo-500" />
      <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">CIL Self-Build Exemption</span>
    </div>

    <div class="rounded-xl border border-zinc-200/50 bg-white shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900">
      <!-- Commencement banner -->
      {#if cilSteps.length > 0}
        {#if !canCommence().allowed}
          <div class="flex items-center gap-3 border-b border-red-200/60 bg-gradient-to-r from-red-50 to-red-50/50 px-5 py-4 dark:border-red-900/30 dark:from-red-950/20 dark:to-red-950/10">
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50 dark:bg-red-900/40 dark:ring-red-950/30">
              <CircleAlert size={18} class="text-red-600 dark:text-red-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-red-800 dark:text-red-300">Cannot Commence Work</p>
              <p class="mt-0.5 text-xs text-red-600 dark:text-red-400 leading-relaxed">{canCommence().reason}</p>
            </div>
          </div>
        {:else}
          <div class="flex items-center gap-3 border-b border-green-100 bg-green-50/80 px-5 py-3.5 dark:border-green-900/30 dark:bg-green-900/10">
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <ShieldCheck size={18} class="text-green-600 dark:text-green-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-green-800 dark:text-green-300">Ready to Commence</p>
              <p class="mt-0.5 text-xs text-green-600 dark:text-green-400">All blocking CIL steps are confirmed</p>
            </div>
          </div>
        {/if}
      {/if}

      {#if cilSteps.length === 0}
        <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Landmark size={20} class="text-zinc-400" />
          </div>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">No CIL steps configured</p>
          <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">CIL workflow steps will appear here once configured</p>
        </div>
      {:else}
        <!-- Step timeline -->
        <div class="p-5 lg:p-6">
          <div class="relative">
            {#each cilSteps as step, i}
              <div class="flex gap-4 {i < cilSteps.length - 1 ? 'pb-6' : ''}">
                <!-- Timeline column -->
                <div class="relative flex flex-col items-center">
                  <!-- Circle -->
                  <div class="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-sm {stepCircleBg(step.status)}">
                    {#if step.status === 'confirmed'}
                      <Check size={16} />
                    {:else if step.status === 'overdue'}
                      <AlertTriangle size={14} />
                    {:else if step.isBlocking && step.status !== 'confirmed'}
                      <Lock size={14} class={step.status === 'not_started' ? 'text-zinc-400 dark:text-zinc-500' : ''} />
                    {:else if step.status === 'submitted'}
                      <CircleDot size={14} />
                    {:else}
                      <span class="text-xs font-semibold text-zinc-400 dark:text-zinc-500">{step.stepNumber}</span>
                    {/if}
                  </div>
                  <!-- Connecting line -->
                  {#if i < cilSteps.length - 1}
                    <div class="w-0.5 flex-1 min-h-[16px] {stepLineBg(step.status)}"></div>
                  {/if}
                </div>

                <!-- Step content -->
                <div class="flex-1 min-w-0 pt-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {step.formName}
                        </p>
                        {#if step.isBlocking}
                          <span class="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            <Lock size={9} />
                            Blocking
                          </span>
                        {/if}
                      </div>
                      <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.description}</p>
                    </div>

                    <!-- Status badge -->
                    <div class="flex-shrink-0">
                      <StatusBadge status={step.status} />
                    </div>
                  </div>

                  <!-- Dates -->
                  <div class="mt-2 flex flex-wrap items-center gap-3">
                    {#if step.deadline}
                      <span class="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                        <Calendar size={10} />
                        Deadline: {formatDate(step.deadline)}
                      </span>
                    {/if}
                    {#if step.submittedDate}
                      <span class="flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400">
                        <CircleDot size={10} />
                        Submitted {formatDate(step.submittedDate)}
                      </span>
                    {/if}
                    {#if step.confirmedDate}
                      <span class="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                        <CircleCheck size={10} />
                        Confirmed {formatDate(step.confirmedDate)}
                      </span>
                    {/if}
                  </div>

                  {#if step.notes}
                    <p class="mt-2 text-[11px] italic text-zinc-400 dark:text-zinc-500 leading-relaxed">{step.notes}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>

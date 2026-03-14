<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { FileCheck, AlertTriangle, Lock, Check, Circle } from 'lucide-svelte';

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

  const conditionTypeBadge: Record<string, { variant: 'critical' | 'warning' | 'info' | 'not_started'; label: string }> = {
    pre_commencement: { variant: 'critical', label: 'Pre-Commencement' },
    pre_occupation: { variant: 'warning', label: 'Pre-Occupation' },
    ongoing: { variant: 'info', label: 'Ongoing' },
    informative: { variant: 'not_started', label: 'Informative' },
  };

  function formatDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  }

  function isExpiringSoon(expiryDate: string): boolean {
    const [year, month, day] = expiryDate.split('-').map(Number);
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    const daysLeft = Math.round((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 90;
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
    return { allowed: true };
  });

  function stepCircleClasses(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'submitted': return 'bg-amber-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      default: return 'border-2 border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900';
    }
  }

  function stepLineClasses(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      default: return 'bg-zinc-200 dark:bg-zinc-700';
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Planning & CIL</h1>
    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Planning permission, conditions, and CIL self-build exemption</p>
  </div>

  <!-- Section 1: Planning Status -->
  <Card>
    <div class="flex items-center gap-2 mb-4">
      <FileCheck size={18} class="text-indigo-500" />
      <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Planning Permission</h2>
    </div>

    {#if planningStatus}
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="text-xs text-zinc-400">Reference</p>
          <p class="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{planningStatus.reference}</p>
        </div>
        <div>
          <p class="text-xs text-zinc-400">Status</p>
          <div class="mt-0.5">
            <StatusBadge status={planningStatus.status} />
          </div>
        </div>
        <div>
          <p class="text-xs text-zinc-400">Expiry</p>
          {#if planningStatus.expiryDate}
            <p class="mt-0.5 text-sm font-medium {isExpiringSoon(planningStatus.expiryDate) ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'}">
              {formatDate(planningStatus.expiryDate)}
              {#if isExpiringSoon(planningStatus.expiryDate)}
                <Badge variant="warning" size="sm" class="ml-2">Expiring soon</Badge>
              {/if}
            </p>
          {:else}
            <p class="mt-0.5 text-sm text-zinc-400">--</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="py-6 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No planning status configured</p>
        <p class="mt-1 text-xs text-zinc-400">Set up your planning reference in project settings</p>
      </div>
    {/if}
  </Card>

  <!-- Section 2: Planning Conditions -->
  <Card>
    <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      Planning Conditions ({conditions.length})
    </h2>

    {#if conditions.length === 0}
      <div class="py-6 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No planning conditions added</p>
      </div>
    {:else}
      <!-- Desktop table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200 dark:border-zinc-800">
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">#</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Description</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Type</th>
              <th class="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Submitted</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Decision</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            {#each conditions as condition}
              {@const typeInfo = conditionTypeBadge[condition.conditionType]}
              <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td class="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{condition.conditionNumber}</td>
                <td class="max-w-[300px] px-3 py-2.5 text-zinc-700 dark:text-zinc-300">{condition.description}</td>
                <td class="px-3 py-2.5 text-center">
                  <Badge variant={typeInfo?.variant ?? 'not_started'}>
                    {typeInfo?.label ?? condition.conditionType}
                  </Badge>
                </td>
                <td class="px-3 py-2.5 text-center">
                  <StatusBadge status={condition.status} />
                </td>
                <td class="whitespace-nowrap px-3 py-2.5 text-zinc-500">
                  {condition.submissionDate ? formatDate(condition.submissionDate) : '-'}
                </td>
                <td class="whitespace-nowrap px-3 py-2.5 text-zinc-500">
                  {condition.decisionDate ? formatDate(condition.decisionDate) : '-'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {#each conditions as condition}
          {@const typeInfo = conditionTypeBadge[condition.conditionType]}
          <div class="px-1 py-3 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Condition {condition.conditionNumber}
                </p>
                <p class="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{condition.description}</p>
              </div>
              <StatusBadge status={condition.status} />
            </div>
            <div class="flex items-center gap-2">
              <Badge variant={typeInfo?.variant ?? 'not_started'}>
                {typeInfo?.label ?? condition.conditionType}
              </Badge>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <!-- Section 3: CIL Self-Build Exemption Workflow -->
  <Card>
    <h2 class="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      CIL Self-Build Exemption Workflow
    </h2>

    <!-- Commencement warning -->
    {#if !canCommence().allowed}
      <div class="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <AlertTriangle size={20} class="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <p class="text-sm font-semibold text-red-800 dark:text-red-300">CANNOT COMMENCE</p>
          <p class="mt-0.5 text-sm text-red-700 dark:text-red-400">{canCommence().reason}</p>
        </div>
      </div>
    {:else}
      <div class="mb-6 flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <Check size={20} class="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
        <div>
          <p class="text-sm font-semibold text-green-800 dark:text-green-300">Ready to Commence</p>
          <p class="mt-0.5 text-sm text-green-700 dark:text-green-400">All blocking CIL steps are confirmed.</p>
        </div>
      </div>
    {/if}

    {#if cilSteps.length === 0}
      <div class="py-6 text-center">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No CIL steps configured</p>
        <p class="mt-1 text-xs text-zinc-400">CIL workflow steps will appear here once configured</p>
      </div>
    {:else}
      <!-- Visual step checklist -->
      <div class="relative space-y-0">
        {#each cilSteps as step, i}
          <div class="flex gap-4">
            <!-- Vertical line and circle -->
            <div class="flex flex-col items-center">
              <!-- Circle -->
              <div class="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full {stepCircleClasses(step.status)}">
                {#if step.status === 'confirmed'}
                  <Check size={16} />
                {:else if step.isBlocking && step.status !== 'confirmed'}
                  <Lock size={14} class={step.status === 'not_started' ? 'text-zinc-400' : ''} />
                {:else if step.status === 'submitted'}
                  <Circle size={12} />
                {:else}
                  <span class="text-xs font-medium text-zinc-400">{step.stepNumber}</span>
                {/if}
              </div>
              <!-- Connecting line -->
              {#if i < cilSteps.length - 1}
                <div class="w-0.5 flex-1 min-h-[24px] {stepLineClasses(step.status)}"></div>
              {/if}
            </div>

            <!-- Step content -->
            <div class="flex-1 pb-6">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {step.formName}
                    {#if step.isBlocking}
                      <span class="ml-1 text-xs text-red-500">(blocking)</span>
                    {/if}
                  </p>
                  <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{step.description}</p>
                </div>
                <StatusBadge status={step.status} />
              </div>

              {#if step.deadline}
                <p class="mt-1 text-xs text-zinc-400">
                  Deadline: {formatDate(step.deadline)}
                </p>
              {/if}

              {#if step.submittedDate}
                <p class="mt-0.5 text-xs text-zinc-400">
                  Submitted: {formatDate(step.submittedDate)}
                </p>
              {/if}

              {#if step.confirmedDate}
                <p class="mt-0.5 text-xs text-green-600 dark:text-green-400">
                  Confirmed: {formatDate(step.confirmedDate)}
                </p>
              {/if}

              {#if step.notes}
                <p class="mt-1 text-xs text-zinc-400 italic">{step.notes}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>

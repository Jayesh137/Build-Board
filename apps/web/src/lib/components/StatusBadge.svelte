<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';

  interface Props {
    status: string;
    size?: 'sm' | 'md';
    class?: string;
  }

  let { status, size = 'sm', class: className = '' }: Props = $props();

  const variantMap: Record<string, 'done' | 'in_progress' | 'not_started' | 'blocked' | 'overdue' | 'info' | 'warning' | 'critical'> = {
    done: 'done',
    passed: 'done',
    confirmed: 'done',
    discharged: 'done',
    verified: 'done',
    fixed: 'done',
    paid: 'done',
    accepted: 'done',
    decided: 'done',
    ordered: 'done',
    in_progress: 'in_progress',
    submitted: 'in_progress',
    booked: 'in_progress',
    assigned: 'in_progress',
    researching: 'in_progress',
    shortlisted: 'in_progress',
    partially_paid: 'in_progress',
    partially_discharged: 'in_progress',
    pending: 'warning',
    conditional: 'warning',
    needs_review: 'warning',
    not_started: 'not_started',
    not_needed: 'not_started',
    blocked: 'blocked',
    failed: 'blocked',
    rejected: 'blocked',
    overdue: 'overdue',
    due: 'info',
  };

  const displayText = $derived(
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );

  const variant = $derived(variantMap[status] ?? 'not_started');
</script>

<Badge {variant} {size} class={className}>
  {displayText}
</Badge>

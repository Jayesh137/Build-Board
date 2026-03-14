export interface NextAction {
  priority: 'critical' | 'warning' | 'info';
  type: 'blocker' | 'deadline' | 'task' | 'decision' | 'inspection';
  title: string;
  reason: string;
  guidance: string;
  link: string;
}

export function computeNextActions(state: {
  cilSteps: Array<{
    formName: string;
    status: string;
    isBlocking: boolean;
  }>;
  planningConditions: Array<{
    conditionNumber: number;
    conditionType: string;
    status: string;
    description: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate: string | null;
    isMilestone: boolean;
    phaseStatus: string;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    status: string;
    deadline: string | null;
    orderByDate: string | null;
  }>;
  inspections: Array<{
    id: string;
    name: string;
    status: string;
    scheduledDate: string | null;
  }>;
}): NextAction[] {
  const actions: NextAction[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // --- Priority 1: CIL blocking steps not confirmed ---
  for (const step of state.cilSteps) {
    if (step.isBlocking && step.status !== 'confirmed') {
      actions.push({
        priority: 'critical',
        type: 'blocker',
        title: `CIL: ${step.formName} not confirmed`,
        reason:
          'This CIL step must be confirmed before commencement. Starting work without it means you owe the full CIL levy.',
        guidance:
          step.formName.toLowerCase().includes('form 7 part 1')
            ? 'Submit your Self Build Exemption Claim (Form 7 Part 1) to your local authority. You must claim BEFORE any work begins on site.'
            : step.formName.toLowerCase().includes('form 6')
              ? 'Submit your Commencement Notice (Form 6) to your local authority at least one day before work starts on site.'
              : `Submit ${step.formName} to your local authority as soon as possible.`,
        link: '/cil',
      });
    }
  }

  // --- Priority 2: Pre-commencement conditions not discharged ---
  for (const condition of state.planningConditions) {
    if (
      condition.conditionType === 'pre_commencement' &&
      condition.status !== 'discharged'
    ) {
      actions.push({
        priority: 'critical',
        type: 'blocker',
        title: `Condition ${condition.conditionNumber} not discharged`,
        reason: `Pre-commencement condition "${condition.description}" must be formally discharged before starting work. Building without discharge is a planning breach.`,
        guidance:
          'Submit the required details to your local planning authority for formal discharge. This typically takes 8-12 weeks, so act early.',
        link: '/planning',
      });
    }
  }

  // --- Priority 3: Failed inspections ---
  for (const inspection of state.inspections) {
    if (inspection.status === 'failed') {
      actions.push({
        priority: 'critical',
        type: 'inspection',
        title: `Failed inspection: ${inspection.name}`,
        reason:
          'A failed inspection must be rectified and re-inspected before work can continue past this stage.',
        guidance:
          'Contact your Building Control officer or warranty inspector to understand what remedial work is needed. Book the re-inspection once work is complete.',
        link: '/inspections',
      });
    }
  }

  // --- Priority 4: Decisions with deadline within 14 days ---
  for (const decision of state.decisions) {
    if (decision.status === 'decided' || decision.status === 'ordered') {
      continue;
    }

    const deadlineStr = decision.deadline ?? decision.orderByDate;
    if (!deadlineStr) continue;

    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      actions.push({
        priority: 'warning',
        type: 'decision',
        title: `OVERDUE decision: ${decision.title}`,
        reason: `This decision was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago. Delays here may hold up dependent tasks and trades.`,
        guidance:
          'Make this decision as soon as possible. If you are still researching, narrow to your top 2 options and decide this week.',
        link: '/decisions',
      });
    } else if (daysUntil <= 14) {
      actions.push({
        priority: 'warning',
        type: 'decision',
        title: `Decision due soon: ${decision.title}`,
        reason: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}. Late decisions cause delays and may affect trades already booked.`,
        guidance:
          daysUntil <= 3
            ? 'This is urgent. Finalise your choice and place any orders needed this week.'
            : 'Review your shortlisted options and aim to decide within the next week to avoid delays.',
        link: '/decisions',
      });
    }
  }

  // --- Priority 5: Tasks overdue or due within 7 days ---
  for (const task of state.tasks) {
    if (task.status === 'done') continue;
    if (!task.dueDate) continue;

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil < 0) {
      actions.push({
        priority: 'warning',
        type: 'task',
        title: `OVERDUE: ${task.title}`,
        reason: `This task was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} ago.${task.isMilestone ? ' This is a milestone — downstream tasks may be blocked.' : ''}`,
        guidance: task.isMilestone
          ? 'This milestone is blocking progress. Prioritise completing it or update the schedule if there is a genuine delay.'
          : 'Review whether this task is still relevant and either complete it or reschedule.',
        link: `/tasks/${task.id}`,
      });
    } else if (daysUntil <= 7) {
      actions.push({
        priority: 'warning',
        type: 'task',
        title: `Due soon: ${task.title}`,
        reason: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.${task.isMilestone ? ' This is a milestone task.' : ''}`,
        guidance:
          task.status === 'not_started'
            ? 'This task has not been started yet. Confirm the responsible person and begin work.'
            : 'Keep this on track to avoid cascading delays.',
        link: `/tasks/${task.id}`,
      });
    }
  }

  // --- Priority 6: Next incomplete task in current (in_progress) phase ---
  const inProgressTasks = state.tasks.filter(
    (t) => t.phaseStatus === 'in_progress' && t.status !== 'done',
  );
  if (inProgressTasks.length > 0) {
    // Find tasks that are not already surfaced as overdue/due-soon above
    const alreadySurfacedIds = new Set(
      actions.filter((a) => a.type === 'task').map((a) => {
        const match = a.link.match(/\/tasks\/(.+)$/);
        return match ? match[1] : null;
      }),
    );

    const nextTask = inProgressTasks.find(
      (t) => !alreadySurfacedIds.has(t.id),
    );
    if (nextTask) {
      actions.push({
        priority: 'info',
        type: 'task',
        title: `Next up: ${nextTask.title}`,
        reason: 'This is the next incomplete task in your current phase.',
        guidance:
          nextTask.status === 'not_started'
            ? 'When you are ready, mark this task as in progress and assign it to the responsible person.'
            : nextTask.status === 'blocked'
              ? 'This task is currently blocked. Check what is preventing progress and resolve the blocker.'
              : 'Continue working on this task.',
        link: `/tasks/${nextTask.id}`,
      });
    }
  }

  // --- Priority 7: Due inspections ---
  for (const inspection of state.inspections) {
    if (inspection.status === 'due' || inspection.status === 'booked') {
      // Skip if already surfaced as failed
      const alreadySurfaced = actions.some(
        (a) =>
          a.type === 'inspection' && a.title.includes(inspection.name),
      );
      if (alreadySurfaced) continue;

      const isBooked = inspection.status === 'booked';
      actions.push({
        priority: 'info',
        type: 'inspection',
        title: `${isBooked ? 'Booked' : 'Due'} inspection: ${inspection.name}`,
        reason: isBooked
          ? `Inspection is booked${inspection.scheduledDate ? ` for ${inspection.scheduledDate}` : ''}. Ensure the relevant work is ready for the inspector.`
          : 'This inspection is due. Book it with your Building Control body or warranty provider before proceeding past this stage.',
        guidance: isBooked
          ? 'Prepare the site for inspection. Ensure the relevant work is visible and accessible. Have drawings available on site.'
          : 'Contact your Building Control officer or warranty inspector to book this inspection. Do not cover up or proceed past the work until it has been inspected.',
        link: '/inspections',
      });
    }
  }

  return actions;
}

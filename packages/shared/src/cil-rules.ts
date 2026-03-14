export interface CILStep {
  stepNumber: number;
  formName: string;
  status: 'not_started' | 'submitted' | 'confirmed' | 'overdue';
  isBlocking: boolean;
}

export function canCommence(steps: CILStep[]): { allowed: boolean; reason?: string } {
  const form7Part1 = steps.find(
    (s) => s.formName.toLowerCase().includes('form 7 part 1'),
  );
  const form6 = steps.find(
    (s) => s.formName.toLowerCase().includes('form 6'),
  );

  if (!form7Part1 || form7Part1.status !== 'confirmed') {
    return {
      allowed: false,
      reason: 'Form 7 Part 1 (Self Build Exemption Claim) must be confirmed before commencement',
    };
  }

  if (!form6 || form6.status !== 'confirmed') {
    return {
      allowed: false,
      reason: 'Form 6 (Commencement Notice) must be confirmed before commencement',
    };
  }

  return { allowed: true };
}

const COMMENCEMENT_ACTIONS = [
  'demolition',
  'site clearance',
  'excavation',
  'groundwork',
  'foundation',
];

export function isCommencementAction(taskTitle: string): boolean {
  const lower = taskTitle.toLowerCase();
  return COMMENCEMENT_ACTIONS.some((action) => lower.includes(action));
}

export function getNextRequiredStep(steps: CILStep[]): CILStep | null {
  for (const step of steps) {
    if (step.isBlocking && step.status !== 'confirmed') {
      return step;
    }
  }
  return null;
}

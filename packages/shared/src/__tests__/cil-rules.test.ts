import { describe, it, expect } from 'vitest';
import {
  canCommence,
  isCommencementAction,
  getNextRequiredStep,
  type CILStep,
} from '../cil-rules';

describe('canCommence', () => {
  const confirmedForm7Part1: CILStep = {
    stepNumber: 1,
    formName: 'Form 7 Part 1',
    status: 'confirmed',
    isBlocking: true,
  };

  const confirmedForm6: CILStep = {
    stepNumber: 2,
    formName: 'Form 6',
    status: 'confirmed',
    isBlocking: true,
  };

  it('should allow commencement when both Form 7 Part 1 and Form 6 are confirmed', () => {
    const result = canCommence([confirmedForm7Part1, confirmedForm6]);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('should not allow commencement when Form 7 Part 1 is missing', () => {
    const result = canCommence([confirmedForm6]);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Form 7 Part 1');
  });

  it('should not allow commencement when Form 6 is missing', () => {
    const result = canCommence([confirmedForm7Part1]);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Form 6');
  });

  it('should not allow commencement when Form 7 Part 1 is only submitted', () => {
    const result = canCommence([
      { ...confirmedForm7Part1, status: 'submitted' },
      confirmedForm6,
    ]);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Form 7 Part 1');
  });

  it('should not allow commencement when Form 6 is not started', () => {
    const result = canCommence([
      confirmedForm7Part1,
      { ...confirmedForm6, status: 'not_started' },
    ]);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Form 6');
  });

  it('should not allow commencement when both forms are not confirmed', () => {
    const result = canCommence([
      { ...confirmedForm7Part1, status: 'submitted' },
      { ...confirmedForm6, status: 'not_started' },
    ]);
    expect(result.allowed).toBe(false);
    // Should mention Form 7 Part 1 first (it's checked first)
    expect(result.reason).toContain('Form 7 Part 1');
  });

  it('should handle empty steps array', () => {
    const result = canCommence([]);
    expect(result.allowed).toBe(false);
  });

  it('should not allow commencement when Form 7 Part 1 is overdue', () => {
    const result = canCommence([
      { ...confirmedForm7Part1, status: 'overdue' },
      confirmedForm6,
    ]);
    expect(result.allowed).toBe(false);
  });
});

describe('isCommencementAction', () => {
  it('should identify commencement actions', () => {
    expect(isCommencementAction('Begin demolition of existing garage')).toBe(true);
    expect(isCommencementAction('Site clearance and setup')).toBe(true);
    expect(isCommencementAction('Excavation for foundations')).toBe(true);
    expect(isCommencementAction('Groundwork phase 1')).toBe(true);
    expect(isCommencementAction('Pour foundation concrete')).toBe(true);
  });

  it('should not identify non-commencement actions', () => {
    expect(isCommencementAction('Install kitchen')).toBe(false);
    expect(isCommencementAction('First fix plumbing')).toBe(false);
    expect(isCommencementAction('Order windows')).toBe(false);
    expect(isCommencementAction('Paint walls')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isCommencementAction('DEMOLITION works')).toBe(true);
    expect(isCommencementAction('Foundation Pour')).toBe(true);
  });
});

describe('getNextRequiredStep', () => {
  it('should return the first blocking step that is not confirmed', () => {
    const steps: CILStep[] = [
      { stepNumber: 1, formName: 'Form 7 Part 1', status: 'confirmed', isBlocking: true },
      { stepNumber: 2, formName: 'Form 6', status: 'submitted', isBlocking: true },
      { stepNumber: 3, formName: 'Form 7 Part 2', status: 'not_started', isBlocking: true },
    ];
    const result = getNextRequiredStep(steps);
    expect(result).not.toBeNull();
    expect(result!.formName).toBe('Form 6');
  });

  it('should return null when all blocking steps are confirmed', () => {
    const steps: CILStep[] = [
      { stepNumber: 1, formName: 'Form 7 Part 1', status: 'confirmed', isBlocking: true },
      { stepNumber: 2, formName: 'Form 6', status: 'confirmed', isBlocking: true },
    ];
    expect(getNextRequiredStep(steps)).toBeNull();
  });

  it('should skip non-blocking steps', () => {
    const steps: CILStep[] = [
      { stepNumber: 1, formName: 'Optional Form', status: 'not_started', isBlocking: false },
      { stepNumber: 2, formName: 'Form 6', status: 'not_started', isBlocking: true },
    ];
    const result = getNextRequiredStep(steps);
    expect(result).not.toBeNull();
    expect(result!.formName).toBe('Form 6');
  });

  it('should return null for empty array', () => {
    expect(getNextRequiredStep([])).toBeNull();
  });

  it('should return null when there are no blocking steps', () => {
    const steps: CILStep[] = [
      { stepNumber: 1, formName: 'Info Form', status: 'not_started', isBlocking: false },
    ];
    expect(getNextRequiredStep(steps)).toBeNull();
  });
});

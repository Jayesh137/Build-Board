import { describe, it, expect } from 'vitest';
import { daysUntil, isOverdue, formatDate, subtractDays } from '../dates';

describe('daysUntil', () => {
  it('should return positive days for future dates', () => {
    expect(daysUntil('2026-03-20', '2026-03-10')).toBe(10);
  });

  it('should return negative days for past dates', () => {
    expect(daysUntil('2026-03-01', '2026-03-10')).toBe(-9);
  });

  it('should return 0 for same day', () => {
    expect(daysUntil('2026-03-10', '2026-03-10')).toBe(0);
  });

  it('should handle month boundaries', () => {
    expect(daysUntil('2026-04-01', '2026-03-31')).toBe(1);
  });

  it('should handle year boundaries', () => {
    expect(daysUntil('2027-01-01', '2026-12-31')).toBe(1);
  });

  it('should handle large differences', () => {
    expect(daysUntil('2027-03-10', '2026-03-10')).toBe(365);
  });
});

describe('isOverdue', () => {
  it('should return true when due date is in the past', () => {
    expect(isOverdue('2026-03-01', '2026-03-10')).toBe(true);
  });

  it('should return false when due date is in the future', () => {
    expect(isOverdue('2026-03-20', '2026-03-10')).toBe(false);
  });

  it('should return false when due date is today', () => {
    expect(isOverdue('2026-03-10', '2026-03-10')).toBe(false);
  });
});

describe('formatDate', () => {
  it('should format ISO date to human readable', () => {
    expect(formatDate('2026-03-13')).toBe('13 Mar 2026');
  });

  it('should handle January', () => {
    expect(formatDate('2026-01-05')).toBe('5 Jan 2026');
  });

  it('should handle December', () => {
    expect(formatDate('2025-12-25')).toBe('25 Dec 2025');
  });

  it('should handle single digit days without padding', () => {
    expect(formatDate('2026-06-01')).toBe('1 Jun 2026');
  });

  it('should handle all months', () => {
    expect(formatDate('2026-02-15')).toBe('15 Feb 2026');
    expect(formatDate('2026-04-10')).toBe('10 Apr 2026');
    expect(formatDate('2026-05-20')).toBe('20 May 2026');
    expect(formatDate('2026-07-04')).toBe('4 Jul 2026');
    expect(formatDate('2026-08-31')).toBe('31 Aug 2026');
    expect(formatDate('2026-09-15')).toBe('15 Sep 2026');
    expect(formatDate('2026-10-01')).toBe('1 Oct 2026');
    expect(formatDate('2026-11-11')).toBe('11 Nov 2026');
  });
});

describe('subtractDays', () => {
  it('should subtract days from a date', () => {
    expect(subtractDays('2026-03-15', 5)).toBe('2026-03-10');
  });

  it('should handle month boundaries', () => {
    expect(subtractDays('2026-03-01', 1)).toBe('2026-02-28');
  });

  it('should handle year boundaries', () => {
    expect(subtractDays('2026-01-01', 1)).toBe('2025-12-31');
  });

  it('should handle subtracting 0 days', () => {
    expect(subtractDays('2026-03-15', 0)).toBe('2026-03-15');
  });

  it('should handle large subtractions', () => {
    expect(subtractDays('2026-03-15', 365)).toBe('2025-03-15');
  });

  it('should handle leap year', () => {
    expect(subtractDays('2024-03-01', 1)).toBe('2024-02-29');
  });
});

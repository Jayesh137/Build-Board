import { describe, it, expect } from 'vitest';
import { penceToPounds, poundsToPence, formatBudget } from '../currency';

describe('penceToPounds', () => {
  it('should convert pence to pounds string', () => {
    expect(penceToPounds(15099)).toBe('£150.99');
  });

  it('should handle zero', () => {
    expect(penceToPounds(0)).toBe('£0.00');
  });

  it('should handle whole pounds', () => {
    expect(penceToPounds(10000)).toBe('£100.00');
  });

  it('should handle small amounts', () => {
    expect(penceToPounds(1)).toBe('£0.01');
    expect(penceToPounds(99)).toBe('£0.99');
  });

  it('should handle negative amounts', () => {
    expect(penceToPounds(-5000)).toBe('-£50.00');
  });

  it('should handle large amounts', () => {
    expect(penceToPounds(50000000)).toBe('£500000.00');
  });
});

describe('poundsToPence', () => {
  it('should convert pounds string to pence', () => {
    expect(poundsToPence('150.99')).toBe(15099);
  });

  it('should handle £ prefix', () => {
    expect(poundsToPence('£150.99')).toBe(15099);
  });

  it('should handle whole pounds', () => {
    expect(poundsToPence('100')).toBe(10000);
  });

  it('should handle zero', () => {
    expect(poundsToPence('0')).toBe(0);
    expect(poundsToPence('£0.00')).toBe(0);
  });

  it('should handle small amounts', () => {
    expect(poundsToPence('0.01')).toBe(1);
    expect(poundsToPence('0.99')).toBe(99);
  });

  it('should handle amounts with spaces after £', () => {
    expect(poundsToPence('£ 150.99')).toBe(15099);
  });
});

describe('formatBudget', () => {
  it('should format pence with commas and £ sign', () => {
    expect(formatBudget(50000000)).toBe('£500,000.00');
  });

  it('should handle zero', () => {
    expect(formatBudget(0)).toBe('£0.00');
  });

  it('should handle amounts under £1000', () => {
    expect(formatBudget(99999)).toBe('£999.99');
  });

  it('should handle amounts with commas at correct positions', () => {
    expect(formatBudget(100000000)).toBe('£1,000,000.00');
  });

  it('should handle small amounts', () => {
    expect(formatBudget(1)).toBe('£0.01');
    expect(formatBudget(100)).toBe('£1.00');
  });

  it('should handle negative amounts', () => {
    expect(formatBudget(-50000000)).toBe('-£500,000.00');
  });

  it('should handle very large amounts', () => {
    expect(formatBudget(10000000000)).toBe('£100,000,000.00');
  });
});

import { describe, it, expect } from 'vitest';
import { classifyVAT, validateVATInvoice } from '../vat-rules';

describe('classifyVAT', () => {
  it('should classify reclaimable building materials', () => {
    expect(classifyVAT('Bricks for external walls')).toBe('yes');
    expect(classifyVAT('50 bags of cement')).toBe('yes');
    expect(classifyVAT('Timber framing pack')).toBe('yes');
    expect(classifyVAT('UPVC windows x 12')).toBe('yes');
    expect(classifyVAT('External doors')).toBe('yes');
    expect(classifyVAT('Insulation rolls 100mm')).toBe('yes');
    expect(classifyVAT('Kitchen units - handleless')).toBe('yes');
    expect(classifyVAT('Boiler - Vaillant ecoTEC')).toBe('yes');
    expect(classifyVAT('Underfloor heating system')).toBe('yes');
    expect(classifyVAT('Paint - Dulux White Mist')).toBe('yes');
    expect(classifyVAT('Roof tiles clay')).toBe('yes');
    expect(classifyVAT('Consumer unit 18-way')).toBe('yes');
    expect(classifyVAT('DPM sheeting')).toBe('yes');
    expect(classifyVAT('Plasterboard sheets')).toBe('yes');
    expect(classifyVAT('Sealant tubes')).toBe('yes');
    expect(classifyVAT('Floor tiles porcelain')).toBe('yes');
    expect(classifyVAT('Guttering and downpipes')).toBe('yes');
    expect(classifyVAT('Staircase oak')).toBe('yes');
    expect(classifyVAT('Ironmongery set')).toBe('yes');
    expect(classifyVAT('Handles for doors')).toBe('yes');
  });

  it('should classify non-reclaimable items', () => {
    expect(classifyVAT('Architect fees')).toBe('no');
    expect(classifyVAT('Structural engineer report')).toBe('no');
    expect(classifyVAT('Scaffolding hire 8 weeks')).toBe('no');
    expect(classifyVAT('Skip hire')).toBe('no');
    expect(classifyVAT('Fridge freezer Samsung')).toBe('no');
    expect(classifyVAT('Washing machine Bosch')).toBe('no');
    expect(classifyVAT('Carpet - living room')).toBe('no');
    expect(classifyVAT('Garden furniture set')).toBe('no');
    expect(classifyVAT('Curtains made to measure')).toBe('no');
    expect(classifyVAT('Insurance - site')).toBe('no');
    expect(classifyVAT('Finance arrangement fee')).toBe('no');
    expect(classifyVAT('Portaloo monthly rental')).toBe('no');
    expect(classifyVAT('Tools - DeWalt kit')).toBe('no');
    expect(classifyVAT('Turf for front garden')).toBe('no');
    expect(classifyVAT('Underlay for carpet')).toBe('no');
    expect(classifyVAT('Blinds - roller')).toBe('no');
  });

  it('should classify items needing review', () => {
    expect(classifyVAT('Fitted wardrobe units')).toBe('needs_review');
    expect(classifyVAT('Solar PV panel installation')).toBe('needs_review');
    expect(classifyVAT('MVHR system Vent-Axia')).toBe('needs_review');
    expect(classifyVAT('Alarm system wireless')).toBe('needs_review');
    expect(classifyVAT('EV charger - Zappi')).toBe('needs_review');
    expect(classifyVAT('Paving slabs for driveway')).toBe('needs_review');
    expect(classifyVAT('Retaining wall blocks')).toBe('needs_review');
    expect(classifyVAT('Built-in appliance package')).toBe('needs_review');
    expect(classifyVAT('Security system')).toBe('needs_review');
  });

  it('should return needs_review for unknown items', () => {
    expect(classifyVAT('Some random unknown item')).toBe('needs_review');
    expect(classifyVAT('')).toBe('needs_review');
    expect(classifyVAT('Miscellaneous')).toBe('needs_review');
  });

  it('should be case-insensitive', () => {
    expect(classifyVAT('BRICKS')).toBe('yes');
    expect(classifyVAT('Cement')).toBe('yes');
    expect(classifyVAT('ARCHITECT')).toBe('no');
    expect(classifyVAT('Solar PV')).toBe('needs_review');
  });
});

describe('validateVATInvoice', () => {
  it('should flag invoice over £250 without claimant details', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 30000, // £300
      hasClaimantNameAddress: false,
      source: 'direct_purchase',
    });
    expect(flags).toContain(
      'Invoice over £250 must show claimant name and site address',
    );
  });

  it('should not flag invoice over £250 with claimant details', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 30000,
      hasClaimantNameAddress: true,
      source: 'direct_purchase',
    });
    expect(flags).not.toContain(
      'Invoice over £250 must show claimant name and site address',
    );
  });

  it('should not flag invoice at or under £250', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 25000, // exactly £250
      hasClaimantNameAddress: false,
      source: 'direct_purchase',
    });
    expect(flags).not.toContain(
      'Invoice over £250 must show claimant name and site address',
    );
  });

  it('should flag contractor VAT error', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 10000,
      hasClaimantNameAddress: true,
      source: 'contractor_vat_error',
    });
    expect(flags).toContain(
      'Contractor incorrectly charged VAT — get invoice corrected before paying',
    );
  });

  it('should not flag direct purchase source', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 10000,
      hasClaimantNameAddress: true,
      source: 'direct_purchase',
    });
    expect(flags).toHaveLength(0);
  });

  it('should return multiple flags when both conditions apply', () => {
    const flags = validateVATInvoice({
      invoiceTotal: 50000,
      hasClaimantNameAddress: false,
      source: 'contractor_vat_error',
    });
    expect(flags).toHaveLength(2);
    expect(flags).toContain(
      'Invoice over £250 must show claimant name and site address',
    );
    expect(flags).toContain(
      'Contractor incorrectly charged VAT — get invoice corrected before paying',
    );
  });
});

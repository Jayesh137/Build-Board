const RECLAIMABLE_KEYWORDS = [
  'bricks', 'blocks', 'concrete', 'cement', 'timber',
  'roof tiles', 'slates', 'windows', 'doors', 'kitchen units',
  'worktops', 'sanitaryware', 'bath', 'wc', 'basin',
  'shower tray', 'taps', 'shower valve', 'shower enclosure',
  'boiler', 'radiator', 'underfloor heating', 'heat pump',
  'sockets', 'switches', 'consumer unit', 'light fitting',
  'insulation', 'plaster', 'plasterboard', 'render',
  'floor tiles', 'engineered wood', 'stone flooring',
  'paint', 'sealant', 'adhesive', 'guttering', 'fascia', 'soffit',
  'dpm', 'membrane', 'staircase', 'ironmongery',
  'hinges', 'handles', 'locks',
];

const NON_RECLAIMABLE_KEYWORDS = [
  'architect', 'engineer', 'surveyor', 'solicitor',
  'scaffolding hire', 'plant hire', 'equipment hire',
  'skip', 'portaloo', 'tools',
  'fridge', 'washing machine', 'dishwasher', 'tumble dryer', 'cooker',
  'carpet', 'underlay', 'furniture',
  'shed', 'greenhouse', 'garden furniture', 'plants', 'turf',
  'curtains', 'blinds', 'av', 'broadband',
  'hoarding', 'finance', 'insurance',
];

const NEEDS_REVIEW_KEYWORDS = [
  'fitted wardrobe', 'built-in appliance', 'solar pv', 'mvhr',
  'alarm', 'security system', 'ev charger',
  'paving', 'retaining wall',
];

export function classifyVAT(description: string): 'yes' | 'no' | 'needs_review' {
  const lower = description.toLowerCase();

  for (const keyword of NEEDS_REVIEW_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'needs_review';
    }
  }

  for (const keyword of RECLAIMABLE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'yes';
    }
  }

  for (const keyword of NON_RECLAIMABLE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'no';
    }
  }

  return 'needs_review';
}

export function validateVATInvoice(entry: {
  invoiceTotal: number;
  hasClaimantNameAddress: boolean;
  source: string;
}): string[] {
  const flags: string[] = [];

  if (entry.invoiceTotal > 25000 && !entry.hasClaimantNameAddress) {
    flags.push(
      'Invoice over £250 must show claimant name and site address',
    );
  }

  if (entry.source === 'contractor_vat_error') {
    flags.push(
      'Contractor incorrectly charged VAT — get invoice corrected before paying',
    );
  }

  return flags;
}

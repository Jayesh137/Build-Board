export interface PhaseGuidance {
  phaseKey: string;
  phaseName: string;
  summary: string;
  whatToFocus: string[];
  tips: { content: string; importance: 'must_know' | 'good_to_know' | 'pro_tip' }[];
  commonMistakes: string[];
  keyDecisions: { title: string; why: string; leadTime: string }[];
}

export const PHASE_GUIDANCE: PhaseGuidance[] = [
  {
    phaseKey: 'A',
    phaseName: 'Pre-Construction',
    summary:
      'Planning and paperwork phase. Getting this right prevents expensive problems later.',
    whatToFocus: [
      'Discharge all pre-commencement planning conditions',
      'Submit CIL self-build exemption (Form 7 Part 1) before any work begins',
      'Appoint architect, structural engineer, and building control body',
      'Arrange structural warranty (NHBC, Premier Guarantee, LABC, etc.)',
      'Apply for utility connections — water, electric, gas, telecoms',
      'Finalise construction drawings and submit building regulations application',
      'Set up site insurance (contract works, public liability, employer\'s liability)',
    ],
    tips: [
      {
        content:
          'Pre-commencement planning conditions MUST be formally discharged by the local authority before starting any work on site. Starting without discharge is a criminal offence.',
        importance: 'must_know',
      },
      {
        content:
          'CIL self-build exemption must be claimed BEFORE commencement. If you miss this, you owe the full CIL levy — often tens of thousands of pounds.',
        importance: 'must_know',
      },
      {
        content:
          'Set a minimum 15% contingency budget. First-time self-builders typically use 10-20% of their contingency on foundations alone.',
        importance: 'must_know',
      },
      {
        content:
          'Changes on paper are free. Changes on site are expensive. Finalise your design decisions now.',
        importance: 'good_to_know',
      },
      {
        content:
          'Get three quotes for every trade. The cheapest is rarely the best — look for reliability, references, and insurance.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Starting work before pre-commencement conditions are discharged',
      'Not completing a soil survey before finalising foundation design',
      'Underestimating utility connection lead times (water can be 3-6 months)',
      'Not claiming CIL exemption before commencement',
      'Skipping structural warranty — most mortgage lenders require one',
    ],
    keyDecisions: [
      {
        title: 'Construction system (timber frame, masonry, SIPs, ICF)',
        why: 'Affects build speed, cost, insulation performance, and which trades you need',
        leadTime: '4-12 weeks for timber frame/SIPs manufacture',
      },
      {
        title: 'Main contractor vs self-managing individual trades',
        why: 'Main contractor costs 15-20% more but manages everything. Self-managing saves money but demands your time daily.',
        leadTime: 'Decision needed before tendering — allow 4-8 weeks for quotes',
      },
      {
        title: 'Warranty provider (NHBC, Premier Guarantee, LABC, Protek)',
        why: 'Lender requirement for most mortgages. Provider must be appointed before work starts as they inspect at key stages.',
        leadTime: 'Apply 4-6 weeks before start on site',
      },
    ],
  },
  {
    phaseKey: 'B',
    phaseName: 'Site Preparation & Groundworks',
    summary:
      'Site prepared for foundations. Ground conditions may surprise you — a soil survey now saves thousands later.',
    whatToFocus: [
      'Accurate setting out of the building footprint by surveyor',
      'Confirm soil type and bearing capacity from soil investigation',
      'Install temporary site services (water, electric, welfare facilities)',
      'Complete any required demolition and site clearance',
      'Install site drainage and temporary surface water management',
      'Book Building Control inspection for foundations stage',
    ],
    tips: [
      {
        content:
          'Always get a proper soil survey / trial pit investigation. The cost (£500-£1,500) is nothing compared to redesigned foundations (£10,000+).',
        importance: 'must_know',
      },
      {
        content:
          'Trees within 30m of the building on clay soil can dramatically increase foundation depth. Check with your structural engineer.',
        importance: 'must_know',
      },
      {
        content:
          'Photograph and video every stage of concealed groundworks — drains, ducts, services. You will need these records later.',
        importance: 'good_to_know',
      },
      {
        content:
          'Order a portaloo and secure tool storage before trades arrive. No facilities = no workers.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Skipping the soil survey and hoping for the best',
      'Covering drainage runs before Building Control inspection',
      'Poor site drainage causing waterlogged trenches and delays',
      'Not protecting neighbouring properties from dust, noise, and vibration',
      'Forgetting to notify Building Control of commencement',
    ],
    keyDecisions: [
      {
        title: 'Foundation type (strip, trench fill, raft, piled)',
        why: 'Depends on soil survey results and structural engineer design. Gets more expensive with poor ground.',
        leadTime: 'Engineer design 2-4 weeks after soil survey',
      },
      {
        title: 'Drainage strategy (mains sewer, septic tank, soakaway)',
        why: 'Must comply with Building Regulations Part H. Soakaways need percolation tests.',
        leadTime: 'Percolation test results take 1-2 weeks',
      },
    ],
  },
  {
    phaseKey: 'C',
    phaseName: 'Foundations',
    summary:
      'Most critical structural element. This is where your contingency budget may first be tested.',
    whatToFocus: [
      'Building Control inspection BEFORE pouring any concrete',
      'DPC (damp-proof course) installation and inspection',
      'Oversite preparation and inspection',
      'Ensure correct steel reinforcement as per engineer\'s drawings',
      'Photograph everything before concrete covers it',
      'Verify foundation depth matches structural engineer\'s specification',
    ],
    tips: [
      {
        content:
          'Foundation depth is minimum 0.9m in normal conditions. Near trees on clay soil, depths of 2-3m+ are common. Budget accordingly.',
        importance: 'must_know',
      },
      {
        content:
          'NEVER pour concrete before Building Control has inspected the trenches. They may require you to dig it all out again.',
        importance: 'must_know',
      },
      {
        content:
          'This is the phase where contingency budgets get their first real test. Ground conditions can change across the site.',
        importance: 'good_to_know',
      },
      {
        content:
          'Concrete needs time to cure — at least 3-7 days depending on weather. Don\'t rush to build on top of green concrete.',
        importance: 'good_to_know',
      },
      {
        content:
          'If your trenches flood overnight, pump them out and let the bottom dry before the pour. Wet trench bottoms weaken foundations.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Pouring concrete before Building Control inspects the trenches',
      'Inadequate DPM (damp-proof membrane) laps and joints',
      'Not curing concrete properly — building on it too quickly',
      'Forgetting to install service ducts through foundations before the pour',
      'Insufficient concrete cover to reinforcement steel',
    ],
    keyDecisions: [
      {
        title: 'Concrete specification and supplier',
        why: 'Structural engineer specifies the mix. Order from a reliable batching plant and have a backup supplier.',
        leadTime: 'Book concrete delivery 3-5 days ahead, confirm day before',
      },
      {
        title: 'Below-ground drainage layout',
        why: 'Easier to install drainage runs now before the slab goes down. Changing later means breaking concrete.',
        leadTime: 'Finalise layout with plumber 1-2 weeks before slab pour',
      },
    ],
  },
  {
    phaseKey: 'D',
    phaseName: 'Superstructure',
    summary:
      'The house starts looking like a house. Finalize window and insulation decisions early — lead times are long.',
    whatToFocus: [
      'Steelwork installation and Building Control inspection',
      'Floor structure (beam and block, timber joists, etc.) and inspection',
      'Wall construction to wall plate level',
      'Order windows and external doors NOW if not already ordered',
      'Confirm insulation specification meets Part L requirements',
      'Cavity wall insulation and ties installation',
    ],
    tips: [
      {
        content:
          'Windows typically have 8-12 week lead times. Order them at the start of superstructure or you will delay the roof.',
        importance: 'must_know',
      },
      {
        content:
          'Part L 2021 insulation requirements are stringent. Confirm U-values with your architect/SAP assessor before ordering materials.',
        importance: 'must_know',
      },
      {
        content:
          'This phase can feel painfully slow — especially masonry builds. One course of blocks per day is normal. Don\'t panic.',
        importance: 'good_to_know',
      },
      {
        content:
          'Keep accurate records of cavity widths, insulation thickness, and wall tie spacing. Building Control and warranty providers check these.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Ordering windows too late — this is the #1 cause of delays at roof stage',
      'Making design changes during the build (moving windows, adding rooms) — hugely expensive',
      'Inadequate insulation thickness not meeting current Part L requirements',
      'Not checking steelwork against structural engineer\'s drawings before building on it',
    ],
    keyDecisions: [
      {
        title: 'Window and door supplier and specification',
        why: 'Affects thermal performance (U-values), aesthetics, and airtightness. Triple glazing increasingly common for Part L compliance.',
        leadTime: '8-12 weeks from order to delivery',
      },
      {
        title: 'Insulation system and specification',
        why: 'Must meet Part L 2021 U-value targets. Walls typically need 100-150mm of PIR or equivalent.',
        leadTime: 'Standard insulation 1-2 weeks. Specialist systems 3-4 weeks.',
      },
      {
        title: 'Lintels and steelwork specification',
        why: 'Must match structural engineer\'s design exactly. Wrong sizes cause major delays.',
        leadTime: 'Standard lintels 1-2 weeks. Fabricated steel 4-6 weeks.',
      },
    ],
  },
  {
    phaseKey: 'E',
    phaseName: 'Roof & Weathertight',
    summary:
      'Biggest milestone of the build. Roof on and windows in means you\'re weathertight — and that triggers a mortgage stage payment.',
    whatToFocus: [
      'Roof structure (trusses or cut roof) Building Control inspection',
      'Roof covering — tiles, slates, or membrane system',
      'Window and external door installation',
      'Achieving weathertight status (roof complete, windows in, external doors fitted)',
      'Notify mortgage lender / valuer for stage payment release',
    ],
    tips: [
      {
        content:
          'Weathertight status triggers the next mortgage stage payment from most self-build lenders. Book the valuation as soon as windows are in.',
        importance: 'must_know',
      },
      {
        content:
          'Once weathertight, internal trades can work regardless of weather. This is a psychological and practical turning point.',
        importance: 'good_to_know',
      },
      {
        content:
          'Get your roofer to install lead flashings properly first time. Poor flashings are the #1 source of leaks in new builds.',
        importance: 'pro_tip',
      },
      {
        content:
          'Ventilate the roof space properly — Part F and Part L requirements. Your SAP assessor can confirm the spec.',
        importance: 'good_to_know',
      },
    ],
    commonMistakes: [
      'Starting internal work before the building is truly weathertight — moisture damage to plaster and timber',
      'Missing or poorly installed lead flashings at junctions, valleys, and abutments',
      'Not checking trusses against engineer\'s drawings before installing',
      'Forgetting to install roof ventilation (eaves and ridge vents)',
    ],
    keyDecisions: [
      {
        title: 'Roof covering material (concrete tiles, clay tiles, slate, zinc, etc.)',
        why: 'Affects weight (structural design), cost, aesthetics, and longevity. May be constrained by planning conditions.',
        leadTime: 'Standard tiles 1-2 weeks. Natural slate 2-4 weeks. Zinc/copper 4-8 weeks.',
      },
      {
        title: 'Rainwater goods (guttering and downpipes)',
        why: 'Must be sized for roof area. Material choice (PVC, aluminium, cast iron) affects cost and aesthetics.',
        leadTime: '1-2 weeks for standard. Aluminium/cast iron 3-4 weeks.',
      },
    ],
  },
  {
    phaseKey: 'F',
    phaseName: 'First Fix',
    summary:
      'Hidden services go in — electrical wiring, plumbing pipes, heating runs. Every layout decision MUST be made BEFORE this phase starts.',
    whatToFocus: [
      'Walk every room with your electrician — agree socket, switch, and light positions',
      'Kitchen layout plan MUST be finalised — it drives plumbing and electrical positions',
      'Bathroom layouts — all waste and water positions set in first fix',
      'Heating system layout — radiator positions, underfloor heating zones, thermostat locations',
      'Fire stopping between floors, around service penetrations',
      'Photograph ALL concealed works before they\'re covered up',
    ],
    tips: [
      {
        content:
          'Create a detailed electrics schedule for every room: number of sockets, switch types, light positions, data points, TV points, outdoor sockets. Walk the house with your electrician.',
        importance: 'must_know',
      },
      {
        content:
          'Your kitchen designer\'s plan is critical — it determines exact plumbing and electrical positions. Having no kitchen plan at first fix is the #1 regret of self-builders.',
        importance: 'must_know',
      },
      {
        content:
          'Fire stopping is a Building Regulations requirement (Part B). Ensure every service penetration through floors and fire walls is properly sealed.',
        importance: 'must_know',
      },
      {
        content:
          'Photograph every wall before plasterboard goes on. Map where pipes and cables run. You will need this when hanging pictures, shelves, and radiators.',
        importance: 'good_to_know',
      },
      {
        content:
          'Run empty conduit to the loft and to key locations for future smart home wiring, CCTV, or aerial/satellite cables. Costs almost nothing now.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Not knowing the kitchen layout at first fix — the #1 self-builder regret',
      'Not enough sockets — double what you think you need',
      'No provision for smart home wiring, ethernet, or future technology',
      'No photographs of concealed pipework and wiring before plasterboard covers it',
      'Forgetting outdoor sockets, garden lighting feeds, and EV charger supply',
    ],
    keyDecisions: [
      {
        title: 'Kitchen layout and supplier',
        why: 'Drives plumbing positions (sink, dishwasher, washing machine) and electrical positions (oven, hob, extractor, fridge). Cannot be changed after first fix without major cost.',
        leadTime: 'Kitchen design 2-4 weeks. Manufacture 4-8 weeks. Must ORDER during first fix.',
      },
      {
        title: 'Heating system (gas boiler, heat pump, MVHR, underfloor heating)',
        why: 'Part L 2021 strongly favours heat pumps and renewables. UFH zones and manifold positions set at first fix.',
        leadTime: 'Heat pump 2-4 weeks. UFH systems 1-2 weeks.',
      },
      {
        title: 'Bathroom sanitaryware selection',
        why: 'Waste positions are set in first fix based on chosen products. A wall-hung WC needs a different frame than a floor-standing one.',
        leadTime: 'Standard items 1-2 weeks. Designer ranges 4-8 weeks.',
      },
    ],
  },
  {
    phaseKey: 'G',
    phaseName: 'Plastering & Drying',
    summary:
      'Walls get their final surface. The house then needs proper drying time before any decoration can begin.',
    whatToFocus: [
      'Plasterboard installation — check for quality, flat surfaces, correct thickness',
      'Skim coat plastering — experienced plasterer is essential',
      'Floor screed (if applicable) — liquid or semi-dry',
      'Allow adequate drying time before any decoration',
      'Run dehumidifiers and maintain gentle background heating',
    ],
    tips: [
      {
        content:
          'Do NOT rush the drying phase. New plaster and screed contain hundreds of litres of water. Decorating too early causes cracking, peeling, and mould.',
        importance: 'must_know',
      },
      {
        content:
          'Use industrial dehumidifiers and gentle background heating (15-20°C). Open windows during the day. A typical house needs 4-8 weeks of drying.',
        importance: 'good_to_know',
      },
      {
        content:
          'A moisture meter is your best friend. Walls should be below 5% moisture content before decorating. Screed should be below 75% RH before laying flooring.',
        importance: 'pro_tip',
      },
      {
        content:
          'Liquid screed (anhydrite) takes longer to dry than semi-dry screed but gives a flatter finish for large open-plan areas.',
        importance: 'good_to_know',
      },
    ],
    commonMistakes: [
      'Decorating before plaster and screed are properly dry — leads to peeling paint and cracking',
      'Walking on screed too early — minimum 24-48 hours for semi-dry, 48-72 hours for liquid screed',
      'Not running dehumidifiers — extends drying time by weeks',
      'Applying paint to damp plaster — traps moisture in the wall',
    ],
    keyDecisions: [
      {
        title: 'Screed type (semi-dry sand/cement vs liquid anhydrite)',
        why: 'Liquid screed is better for underfloor heating but takes longer to dry. Semi-dry is quicker but harder to get perfectly flat.',
        leadTime: 'Book screed contractor 2-3 weeks ahead. Drying adds 4-8 weeks.',
      },
      {
        title: 'Plaster finish (skim, dry-lined, or specialist finishes)',
        why: 'Multi-finish skim is the UK standard. Dry-lining with jointed plasterboard is faster but harder to achieve a flawless finish.',
        leadTime: 'Standard materials readily available. Specialist plasters 1-2 weeks.',
      },
    ],
  },
  {
    phaseKey: 'H',
    phaseName: 'Second Fix & Finishes',
    summary:
      'The house starts feeling like a home. Kitchen fitted, bathrooms tiled, doors hung, and everything decorated.',
    whatToFocus: [
      'Electrical second fix — sockets, switches, light fittings, consumer unit',
      'Plumbing second fix — taps, basins, WCs, showers, bath',
      'Boiler/heat pump commissioning and certification',
      'Kitchen installation',
      'Tiling — bathrooms, kitchen splashback, utility room',
      'Internal doors, skirting, architrave, and ironmongery',
      'Decoration — mist coat first, then undercoat and topcoat',
      'Flooring — always the LAST thing to go in',
    ],
    tips: [
      {
        content:
          'Apply a mist coat (watered-down emulsion, 50/50) on all new plaster before any other paint. New plaster is highly absorbent and paint will peel without a mist coat.',
        importance: 'must_know',
      },
      {
        content:
          'Flooring is always the LAST thing installed. Everything else — painting, kitchen, skirting — happens first to avoid damage.',
        importance: 'must_know',
      },
      {
        content:
          'Second fix always takes longer than you expect. There are hundreds of small tasks. Allow 4-6 weeks minimum for a standard house.',
        importance: 'good_to_know',
      },
      {
        content:
          'Order all ironmongery (door handles, hinges, locks, window furniture) in one batch to ensure consistent finish. Easy to forget but noticeable when mismatched.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Installing flooring too early — trades will damage it',
      'No mist coat on new plaster — topcoat peels off within months',
      'Forgetting to order ironmongery (door handles, locks, hinges) — causes delays',
      'Not commissioning the boiler/heat pump properly — invalidates warranty',
      'Tiling before second fix plumbing positions are confirmed',
    ],
    keyDecisions: [
      {
        title: 'Flooring throughout (engineered wood, LVT, tile, carpet)',
        why: 'Different substrates need different preparation. Underfloor heating limits some options. Order early as popular ranges sell out.',
        leadTime: 'Engineered wood 2-4 weeks. Natural stone 4-8 weeks. Carpet 1-2 weeks.',
      },
      {
        title: 'Internal door style and supplier',
        why: 'Affects the feel of the whole house. Fire doors required between garage and habitable rooms, and on escape routes.',
        leadTime: 'Standard doors 1-2 weeks. Bespoke doors 6-10 weeks.',
      },
      {
        title: 'Light fittings and switches',
        why: 'Backboxes are already in from first fix — fittings must be compatible. Dimmer switches need LED-compatible types.',
        leadTime: 'Standard fittings 1-2 weeks. Designer ranges 4-8 weeks.',
      },
    ],
  },
  {
    phaseKey: 'I',
    phaseName: 'External Works',
    summary:
      'The outside of the house gets finished — driveway, landscaping, fencing, and the scaffold finally comes down.',
    whatToFocus: [
      'Final drainage test (Building Control must witness)',
      'Driveway construction (sub-base, surface, drainage)',
      'Landscaping — levels, topsoil, planting, turfing',
      'External lighting and power',
      'Scaffold removal — coordinate with any remaining external work',
      'Fencing and boundary treatments',
    ],
    tips: [
      {
        content:
          'Building Control must witness the final drainage test (air test or water test). Book this well in advance — they have limited slots.',
        importance: 'must_know',
      },
      {
        content:
          'A dropped kerb for your driveway requires a separate application to the local authority highways department. Allow 6-12 weeks.',
        importance: 'must_know',
      },
      {
        content:
          'Consider permeable paving for driveways over 5m² — it avoids the need for a separate planning application under permitted development.',
        importance: 'good_to_know',
      },
      {
        content:
          'Install outdoor sockets, garden lighting ducting, and EV charger conduit before landscaping covers access points.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Booking the drainage test too late — can delay completion certificate',
      'Not applying for a dropped kerb early enough — 6-12 week lead time',
      'Not considering permeable paving requirements for driveways',
      'Removing scaffold before all external work (render, cladding, soffits) is complete',
    ],
    keyDecisions: [
      {
        title: 'Driveway surface (block paving, resin bound, tarmac, gravel)',
        why: 'Affects drainage requirements, maintenance, cost, and kerb appeal. Must consider SuDS compliance.',
        leadTime: 'Materials 1-2 weeks. Dropped kerb application 6-12 weeks.',
      },
      {
        title: 'Landscaping design',
        why: 'Hard landscaping (patios, paths, retaining walls) should be done before soft landscaping (planting, turf).',
        leadTime: 'Design 1-2 weeks. Hard landscaping materials 1-3 weeks.',
      },
    ],
  },
  {
    phaseKey: 'J',
    phaseName: 'Testing & Sign-Off',
    summary:
      'The regulatory finish line. All tests and inspections must pass to get your completion certificate.',
    whatToFocus: [
      'Air tightness test (Part L requirement)',
      'SAP calculation and EPC (Energy Performance Certificate)',
      'Compile ALL certificates — electrical (Part P), gas safety, boiler/heat pump commissioning, window FENSA/CERTASS',
      'Building Control final inspection',
      'Warranty provider final inspection',
      'Sound testing (if semi-detached or if required by condition)',
    ],
    tips: [
      {
        content:
          'The completion certificate from Building Control is essential. Without it, you cannot prove the building is compliant — this affects mortgages, insurance, and resale.',
        importance: 'must_know',
      },
      {
        content:
          'Collect ALL certificates throughout the build — don\'t leave it to the end. Electrical Part P certificate, gas safe certificate, window certificates (FENSA/CERTASS), commissioning certificates.',
        importance: 'must_know',
      },
      {
        content:
          'The air tightness test is a Part L requirement. Your SAP assessor will tell you the target. Seal all service penetrations, around windows, and at junctions before the test.',
        importance: 'good_to_know',
      },
      {
        content:
          'Create a "handover file" folder with every certificate, manual, warranty, and test result. Future you (or your solicitor when selling) will thank you.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Missing certificates at the end — chase them throughout the build, not at completion',
      'Failing the air tightness test — seal penetrations before the test, not after',
      'Missed Building Control inspections during the build — they may require opening up work to inspect',
      'Not having the EPC ready — required before occupation',
    ],
    keyDecisions: [
      {
        title: 'Air tightness testing company',
        why: 'Must be UKAS accredited. They can do a pre-test to identify leaks before the official test.',
        leadTime: 'Book 2-3 weeks ahead. Pre-test recommended 1-2 weeks before official test.',
      },
      {
        title: 'SAP assessor for as-built assessment and EPC',
        why: 'The as-built SAP must reflect what was actually installed, not the design stage assumptions.',
        leadTime: 'Allow 1-2 weeks for the assessor to complete after receiving all specifications.',
      },
    ],
  },
  {
    phaseKey: 'K',
    phaseName: 'Completion & Move-In',
    summary:
      'You built a house! Now handle the paperwork: VAT reclaim, council tax registration, CIL Form 7 Part 2, and move in.',
    whatToFocus: [
      'Thorough snagging walkthrough — every room, every surface',
      'VAT reclaim submission (STRICT 3-month deadline from completion certificate date — previously 6 months, now reduced)',
      'Submit CIL Form 7 Part 2 (completion and occupancy)',
      'Register for council tax',
      'Arrange buildings insurance (warranty provider may require specific cover)',
      'Final utility meter installations and account setup',
    ],
    tips: [
      {
        content:
          'The VAT reclaim deadline is STRICT — 3 months from the date of your completion certificate. Miss it and you lose thousands. Start gathering invoices NOW.',
        importance: 'must_know',
      },
      {
        content:
          'CIL self-build exemption requires a 3-year occupancy period starting from completion. You must live in the property as your sole or main residence. CIL Form 7 Part 2 notifies the council.',
        importance: 'must_know',
      },
      {
        content:
          'Do a detailed snagging walkthrough in daylight. Use a bright torch held at an angle to walls and ceilings to spot imperfections. Mark snags with removable blue tape.',
        importance: 'good_to_know',
      },
      {
        content:
          'Celebrate. Seriously. Less than 10% of people who dream of self-building actually complete a house. You\'ve done something extraordinary.',
        importance: 'pro_tip',
      },
    ],
    commonMistakes: [
      'Missing the VAT reclaim deadline — thousands of pounds lost forever',
      'Incomplete snagging list — do it systematically, room by room',
      'No buildings insurance from day one of occupation',
      'Not submitting CIL Form 7 Part 2 — can trigger the full CIL levy',
      'Forgetting to register for council tax — can result in backdated bills',
    ],
    keyDecisions: [
      {
        title: 'VAT reclaim preparation',
        why: 'You can only submit ONE claim. Ensure every valid invoice is included with correct documentation. HMRC rejects incomplete claims.',
        leadTime: 'Start organising invoices immediately. Submit within 3 months of completion certificate.',
      },
      {
        title: 'Snagging process and timeline',
        why: 'Contractors are easier to get back while final payment is withheld. Agree a snagging retention (typically 2.5-5%) in contracts.',
        leadTime: 'Complete snagging within 2-4 weeks of practical completion.',
      },
    ],
  },
];

export function getPhaseGuidance(phaseName: string): PhaseGuidance | undefined {
  const lower = phaseName.toLowerCase();
  return PHASE_GUIDANCE.find(
    (g) =>
      g.phaseKey.toLowerCase() === lower ||
      g.phaseName.toLowerCase() === lower ||
      g.phaseName.toLowerCase().includes(lower),
  );
}

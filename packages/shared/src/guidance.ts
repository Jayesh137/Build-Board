import type {
  Task,
  Phase,
  Decision,
  Inspection,
  PlanningCondition,
  CILStepRecord,
} from './types';
import { daysUntil, isOverdue } from './dates';

// ---------------------------------------------------------------------------
// computeNextActions
// ---------------------------------------------------------------------------

export interface NextAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'condition' | 'cil' | 'task' | 'decision' | 'inspection';
  title: string;
  reason: string;
  guidance: string;
  link: string;
}

export interface NextActionsInput {
  cilSteps: CILStepRecord[];
  planningConditions: PlanningCondition[];
  tasks: Task[];
  decisions: Decision[];
  inspections: Inspection[];
}

export function computeNextActions(input: NextActionsInput): NextAction[] {
  const actions: NextAction[] = [];
  const today = new Date().toISOString().slice(0, 10);

  // 1. CIL steps that are blocking and not confirmed
  for (const step of input.cilSteps) {
    if (step.isBlocking && step.status !== 'confirmed') {
      const overdue = step.deadline ? isOverdue(step.deadline, today) : false;
      actions.push({
        priority: overdue ? 'critical' : 'high',
        type: 'cil',
        title: `Submit ${step.formName}`,
        reason: overdue
          ? `Deadline was ${step.deadline} — this blocks commencement`
          : 'This must be confirmed before you can start on site',
        guidance:
          'Download the form from your local authority planning portal. Submit it with your planning reference number.',
        link: '/planning',
      });
    }
  }

  // 2. Pre-commencement conditions not discharged
  for (const cond of input.planningConditions) {
    if (
      cond.conditionType === 'pre_commencement' &&
      cond.status !== 'discharged'
    ) {
      actions.push({
        priority: 'critical',
        type: 'condition',
        title: `Discharge condition ${cond.conditionNumber}`,
        reason:
          'Pre-commencement conditions must be discharged before any work starts on site',
        guidance: cond.description || 'Review the condition wording and prepare your submission.',
        link: '/planning',
      });
    }
  }

  // 3. Overdue or due-soon tasks
  for (const task of input.tasks) {
    if (task.status === 'done') continue;

    if (task.dueDate && isOverdue(task.dueDate, today)) {
      actions.push({
        priority: task.isMilestone ? 'critical' : 'high',
        type: 'task',
        title: task.title,
        reason: `Overdue — was due ${task.dueDate}`,
        guidance: task.isMilestone
          ? 'This is a milestone task. Delays here may cascade to other phases.'
          : 'Check if dependencies are blocking this, or if you need to chase the contractor.',
        link: '/timeline',
      });
    } else if (task.dueDate) {
      const days = daysUntil(task.dueDate, today);
      if (days <= 7 && days >= 0) {
        actions.push({
          priority: task.isMilestone ? 'high' : 'medium',
          type: 'task',
          title: task.title,
          reason: days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`,
          guidance: 'Make sure the contractor has everything they need and materials are on site.',
          link: '/timeline',
        });
      }
    }

    if (task.status === 'blocked') {
      actions.push({
        priority: 'high',
        type: 'task',
        title: task.title,
        reason: 'This task is blocked — find out why and unblock it',
        guidance:
          'Check if it depends on a decision, delivery, or inspection. Resolving the blocker should be your top priority.',
        link: '/timeline',
      });
    }
  }

  // 4. Decisions approaching deadline
  for (const decision of input.decisions) {
    if (decision.status === 'decided' || decision.status === 'ordered') continue;

    if (decision.deadline && isOverdue(decision.deadline, today)) {
      actions.push({
        priority: 'critical',
        type: 'decision',
        title: decision.title,
        reason: `Decision deadline passed (${decision.deadline})`,
        guidance:
          'Late decisions can delay trades and cost money. Even a provisional decision is better than none.',
        link: '/decisions',
      });
    } else if (decision.orderByDate) {
      const days = daysUntil(decision.orderByDate, today);
      if (days <= 14 && days >= 0) {
        actions.push({
          priority: days <= 7 ? 'high' : 'medium',
          type: 'decision',
          title: decision.title,
          reason: `Must order by ${decision.orderByDate} (${days} day${days === 1 ? '' : 's'} left)`,
          guidance: decision.leadTimeDays
            ? `Lead time is ${decision.leadTimeDays} days. Order soon to avoid delaying the build.`
            : 'Check the supplier lead time and order early to avoid delays.',
          link: '/decisions',
        });
      }
    } else if (decision.deadline) {
      const days = daysUntil(decision.deadline, today);
      if (days <= 14 && days >= 0) {
        actions.push({
          priority: days <= 7 ? 'high' : 'medium',
          type: 'decision',
          title: decision.title,
          reason: `Decision needed by ${decision.deadline}`,
          guidance:
            'Research your options, get at least 3 quotes, and decide before the deadline.',
          link: '/decisions',
        });
      }
    }
  }

  // 5. Inspections that are due or booked soon
  for (const insp of input.inspections) {
    if (insp.status === 'passed' || insp.status === 'not_needed') continue;

    if (insp.status === 'due') {
      actions.push({
        priority: 'high',
        type: 'inspection',
        title: `Book: ${insp.name}`,
        reason: 'Inspection is due but not yet booked',
        guidance:
          'Contact your building control officer or warranty provider to schedule. They often need 48 hours notice.',
        link: '/inspections',
      });
    } else if (insp.status === 'failed' || insp.status === 'conditional') {
      actions.push({
        priority: 'critical',
        type: 'inspection',
        title: `Fix: ${insp.name}`,
        reason:
          insp.status === 'failed'
            ? 'Inspection failed — remedial work needed before continuing'
            : 'Inspection passed with conditions — address them promptly',
        guidance:
          insp.resultNotes || 'Review the inspector notes and arrange remedial work.',
        link: '/inspections',
      });
    } else if (insp.status === 'booked' && insp.scheduledDate) {
      const days = daysUntil(insp.scheduledDate, today);
      if (days <= 3 && days >= 0) {
        actions.push({
          priority: 'medium',
          type: 'inspection',
          title: `Upcoming: ${insp.name}`,
          reason:
            days === 0
              ? 'Inspection is today'
              : `Inspection in ${days} day${days === 1 ? '' : 's'}`,
          guidance:
            'Make sure the work area is accessible and tidy. Have drawings available on site.',
          link: '/inspections',
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return actions;
}

// ---------------------------------------------------------------------------
// getPhaseGuidance
// ---------------------------------------------------------------------------

export interface PhaseGuidance {
  summary: string;
  whatToFocus: string[];
  tips: Array<{ content: string; importance: 'high' | 'medium' | 'low' }>;
  commonMistakes: string[];
  keyDecisions: Array<{ title: string; why: string; leadTime: string }>;
}

const PHASE_GUIDANCE: Record<string, PhaseGuidance> = {
  'Pre-Construction': {
    summary:
      'This phase covers everything before ground is broken: planning conditions, CIL paperwork, insurance, contractor procurement, and site preparation.',
    whatToFocus: [
      'Discharge all pre-commencement planning conditions',
      'Submit CIL exemption forms (Form 7 Part 1 + Form 6)',
      'Appoint a building control body (Local Authority or Approved Inspector)',
      'Finalise contractor contracts with fixed-price or capped rates',
      'Set up site insurance (self-build policy)',
    ],
    tips: [
      { content: 'Get 3 quotes for every trade, even if you know who you want to use. It gives you negotiating power.', importance: 'high' },
      { content: 'Keep a copy of every planning document in a waterproof site folder — inspectors will ask.', importance: 'medium' },
      { content: 'Open a separate bank account for the build. It makes VAT reclaim much easier later.', importance: 'high' },
      { content: 'Photograph the existing site from every angle before any work begins.', importance: 'medium' },
      { content: 'Introduce yourself to neighbours early — a small gesture now prevents complaints later.', importance: 'low' },
    ],
    commonMistakes: [
      'Starting on site before pre-commencement conditions are discharged (this invalidates your planning permission)',
      'Forgetting to submit CIL Form 6 (Commencement Notice) — you lose your self-build exemption',
      'Not having a warranty provider signed up (NHBC, Premier Guarantee, etc.) before work starts',
      'Under-estimating the build programme by 30-40% — add contingency time too',
    ],
    keyDecisions: [
      { title: 'Building control body', why: 'Must be appointed before work begins', leadTime: '2-4 weeks' },
      { title: 'Warranty provider', why: 'Required by most mortgage lenders', leadTime: '3-6 weeks' },
      { title: 'Main contractor or project manager', why: 'The biggest single decision for the build', leadTime: '4-8 weeks' },
      { title: 'Site insurance', why: 'Covers public liability, employer liability, and works damage', leadTime: '1-2 weeks' },
    ],
  },
  'Groundworks': {
    summary:
      'Site clearance, demolition (if applicable), setting out, and excavation. The foundations of your foundations.',
    whatToFocus: [
      'Confirm exact setting-out with the architect or engineer',
      'Ensure drainage routes and service connections are marked',
      'Book the foundation inspection with building control',
      'Check soil conditions match the structural engineer assumptions',
      'Set up welfare facilities on site (portaloo, water, power)',
    ],
    tips: [
      { content: 'Hire a site survey team to set out corner pegs — even a few cm error now compounds later.', importance: 'high' },
      { content: 'If you hit unexpected ground (clay, rock, water), call the structural engineer before proceeding.', importance: 'high' },
      { content: 'Photograph open trenches before concrete goes in — this evidence helps at completion.', importance: 'medium' },
      { content: 'Order concrete with the correct mix specification from your engineer, not the default.', importance: 'medium' },
    ],
    commonMistakes: [
      'Digging too deep or too shallow — always verify reduced levels with the engineer',
      'Not protecting neighbouring trees with root protection areas (RPAs)',
      'Skipping the foundation inspection — building control must sign off before you pour',
      'Forgetting to lay service ducts through foundations before concrete is poured',
    ],
    keyDecisions: [
      { title: 'Concrete supplier', why: 'Need reliability for pour day', leadTime: '1 week' },
      { title: 'Foundation type (strip, trench fill, raft)', why: 'Depends on ground conditions', leadTime: '2-4 weeks' },
      { title: 'Below-ground drainage layout', why: 'Must be installed before foundations in some designs', leadTime: '1-2 weeks' },
    ],
  },
  'Foundations': {
    summary:
      'Pouring foundations, building up to DPC level, laying floor slabs and installing below-ground drainage.',
    whatToFocus: [
      'Ensure building control inspect before each concrete pour',
      'Verify steel reinforcement placement matches structural drawings',
      'Install radon barrier / DPM as specified',
      'Lay underfloor heating pipes if specified (before screed)',
      'Complete below-ground drainage and get it pressure tested',
    ],
    tips: [
      { content: 'Have the structural engineer visit for the first pour — peace of mind is worth the fee.', importance: 'high' },
      { content: 'Use a laser level to check DPC heights — accuracy here saves endless headaches for the bricklayers.', importance: 'high' },
      { content: 'Take dimensioned photos of all pipework and ducts before they are covered — you will need these later.', importance: 'medium' },
    ],
    commonMistakes: [
      'Pouring in freezing conditions without frost protection — concrete can fail',
      'Not vibrating / compacting the concrete properly',
      'Forgetting to install mechanical ventilation ducts or insulation below the slab',
      'Getting floor levels wrong — this is extremely costly to fix later',
    ],
    keyDecisions: [
      { title: 'Underfloor heating system', why: 'Pipes must be laid before floor screed', leadTime: '2-3 weeks' },
      { title: 'Floor insulation specification', why: 'Affects U-values for Building Regs', leadTime: '1 week' },
      { title: 'Radon protection level', why: 'Depends on your site location', leadTime: '1 week' },
    ],
  },
  'Superstructure': {
    summary:
      'Walls, floors, and structural frame going up. The building takes shape during this exciting phase.',
    whatToFocus: [
      'Check block/brick deliveries are on schedule — shortages cause costly delays',
      'Verify wall ties, lintels, and cavity widths match structural drawings',
      'Book building control inspections at each floor level',
      'Monitor vertical alignment (plumb) — do not wait until roof level to check',
      'Install any structural steelwork with appropriate fire protection',
    ],
    tips: [
      { content: 'Visit the site daily if possible — problems are cheap to fix today, expensive tomorrow.', importance: 'high' },
      { content: 'Keep bricks/blocks dry and covered — wet materials affect mortar bond strength.', importance: 'medium' },
      { content: 'Confirm window and door opening sizes with the manufacturer before the openings are built.', importance: 'high' },
      { content: 'Scaffold should be erected by a qualified company with a scaffold inspection certificate.', importance: 'medium' },
    ],
    commonMistakes: [
      'Ordering the wrong brick — check colour and texture match the planning approval',
      'Not installing cavity barriers at the correct locations',
      'Leaving openings the wrong size for windows/doors (measure twice!)',
      'Forgetting to build in meter boxes, extract fan ducts, and flue terminals',
    ],
    keyDecisions: [
      { title: 'Windows and external doors', why: 'Long lead item, openings must match', leadTime: '6-12 weeks' },
      { title: 'Roof trusses / cut roof design', why: 'Must be ordered well ahead of superstructure completion', leadTime: '4-8 weeks' },
      { title: 'External cladding / render system', why: 'Affects cavity width and wall ties', leadTime: '3-6 weeks' },
    ],
  },
  'Roof': {
    summary:
      'Roof structure, tiling/slating, and making the building watertight. A major milestone.',
    whatToFocus: [
      'Coordinate truss/rafter delivery with crane hire',
      'Ensure felt/membrane and battens installed correctly before tiles',
      'Book building control for roof structure inspection',
      'Install lead flashing at all junctions, chimneys, and abutments',
      'Verify ventilation requirements at eaves and ridge',
    ],
    tips: [
      { content: 'Getting watertight (roof and windows in) is the biggest de-risking milestone — push for this before bad weather.', importance: 'high' },
      { content: 'Have the roofer install temporary protection if tiles are delayed — exposed felt will degrade.', importance: 'medium' },
      { content: 'Check the tile battens are at the right gauge for your tile type — manufacturer specs vary.', importance: 'medium' },
    ],
    commonMistakes: [
      'Installing trusses in the wrong order or orientation — follow the engineers layout drawing exactly',
      'Inadequate bracing of trusses during installation',
      'Using the wrong roofing felt / membrane for the roof pitch',
      'Forgetting to install roof ventilation, especially if the loft will be used as habitable space',
    ],
    keyDecisions: [
      { title: 'Roof tiles / slates', why: 'Must match planning approval, need to be ordered for delivery timing', leadTime: '2-4 weeks' },
      { title: 'Guttering and rainwater system', why: 'Needed as soon as roof is tiled', leadTime: '1-2 weeks' },
      { title: 'Rooflights / Velux windows', why: 'Openings must be framed into the roof structure', leadTime: '2-4 weeks' },
    ],
  },
  'First Fix': {
    summary:
      'All the hidden work: electrical wiring, plumbing, heating pipes, and studwork before plastering.',
    whatToFocus: [
      'Confirm positions for sockets, switches, lights, and data points on site',
      'Install MVHR or extract fan ducting before insulation goes in',
      'Complete plumbing first fix — hot/cold pipes, waste runs, gas pipework',
      'Insulate all external walls, floor, and roof as specified',
      'Book the building control pre-plaster inspection',
    ],
    tips: [
      { content: 'Walk through each room with the electrician and mark socket and switch positions with tape on the wall. Live with them for a day before confirming.', importance: 'high' },
      { content: 'Take detailed photos of every wall before it is boarded — you will forget where the pipes and wires are.', importance: 'high' },
      { content: 'Label all circuit cables at both ends — the electrician will thank you at second fix.', importance: 'medium' },
      { content: 'Insulation must be continuous with no gaps, especially around window reveals and at eaves.', importance: 'high' },
    ],
    commonMistakes: [
      'Boarding over pipes without pressure testing first',
      'Not leaving enough cable for future smart home wiring (always pull extra Cat6)',
      'Insulation gaps — even 5% missing area can reduce performance by 25%',
      'Forgetting soil vent pipe (SVP) routing through the building',
    ],
    keyDecisions: [
      { title: 'Kitchen layout', why: 'Determines plumbing, electrics, and extract positions', leadTime: '4-8 weeks' },
      { title: 'Bathroom suite', why: 'Waste and water positions depend on chosen sanitaryware', leadTime: '2-6 weeks' },
      { title: 'Heating system (boiler, heat pump, etc.)', why: 'Must be installed at first fix', leadTime: '2-4 weeks' },
      { title: 'Electrical layout plan', why: 'Wiring goes in before plaster', leadTime: '1-2 weeks' },
    ],
  },
  'Plastering': {
    summary:
      'Internal walls and ceilings skimmed or dry-lined. The house starts to feel like a home.',
    whatToFocus: [
      'Ensure all first fix is fully signed off before plastering begins',
      'Protect finished plaster from follow-on trades (dust sheets, corner guards)',
      'Allow adequate drying time before decoration (2-4 weeks depending on conditions)',
      'Check for cracking as plaster dries — minor shrinkage cracks are normal, large ones are not',
    ],
    tips: [
      { content: 'Good plastering hides a multitude of sins, but bad plastering is very obvious. Invest in a good plasterer.', importance: 'high' },
      { content: 'Keep windows slightly open during drying — trapped moisture leads to damp and mould.', importance: 'medium' },
      { content: 'If using a dehumidifier to speed drying, do not over-dry — it can cause cracking.', importance: 'medium' },
    ],
    commonMistakes: [
      'Starting second fix too early — plaster needs time to dry or it will crack at fixing points',
      'Not protecting floors from plaster spills',
      'Forgetting to install architrave and skirting grounds / backing before plastering',
      'Painting over damp plaster — it traps moisture and causes peeling',
    ],
    keyDecisions: [
      { title: 'Plaster type (wet plaster vs dry lining)', why: 'Affects finish quality, drying time, and cost', leadTime: '1 week' },
      { title: 'Coving and cornice profiles', why: 'Installed by plasterer — must choose style before they start', leadTime: '1 week' },
    ],
  },
  'Second Fix': {
    summary:
      'Kitchens, bathrooms, electrics, carpentry, and all the finishes that make the building liveable.',
    whatToFocus: [
      'Coordinate trades carefully — kitchen fitter, electrician, plumber, carpenter all overlap',
      'Install kitchen units before worktop templating',
      'Complete bathroom tiling before sanitary ware installation',
      'Fit internal doors, skirting boards, and architraves',
      'Commission heating system and hot water',
    ],
    tips: [
      { content: 'Create a room-by-room checklist of finishes. It is easy to miss items when multiple trades are on site.', importance: 'high' },
      { content: 'Keep spares of every tile, paint colour, and fitting — you will need them for snags and future repairs.', importance: 'medium' },
      { content: 'Test every socket, switch, tap, and drain as soon as it is installed — do not wait for handover.', importance: 'high' },
      { content: 'Protect finished floors with proper floor protection, not just dust sheets.', importance: 'medium' },
    ],
    commonMistakes: [
      'Not templating worktops early enough — stone worktops have 2-3 week lead times after templating',
      'Installing expensive flooring before all other trades have finished',
      'Forgetting to fill and sand between coats of paint',
      'Not testing the heating system under load before the plumber leaves',
    ],
    keyDecisions: [
      { title: 'Worktop material and colour', why: 'Templated after kitchen units installed, long lead time for stone', leadTime: '2-4 weeks' },
      { title: 'Flooring throughout', why: 'Must be decided before skirting height is set', leadTime: '2-6 weeks' },
      { title: 'Light fittings', why: 'Needed for second fix electrical', leadTime: '1-4 weeks' },
      { title: 'Door furniture (handles, locks)', why: 'Needed when hanging internal doors', leadTime: '1-2 weeks' },
    ],
  },
  'External': {
    summary:
      'Driveways, landscaping, fencing, and external finishes including render and cladding completion.',
    whatToFocus: [
      'Complete external render, cladding, or brickwork pointing',
      'Install driveway and paths',
      'Build boundary walls and fencing',
      'Landscape and turf — allow time for ground to settle first',
      'Connect external drainage to mains sewer or soakaway',
    ],
    tips: [
      { content: 'Plan external works for dry weather — groundworks in winter turn the garden into a mud bath.', importance: 'high' },
      { content: 'Install external taps and power sockets before the ground is finished — retrofitting is messy.', importance: 'medium' },
      { content: 'Make sure your skip / waste removal is sorted before final landscaping.', importance: 'medium' },
    ],
    commonMistakes: [
      'Rendering in freezing or very hot weather — temperature affects curing',
      'Not installing land drainage where needed — surface water must go somewhere',
      'Laying turf on poorly prepared ground — it will be patchy and uneven',
      'Forgetting to apply for a dropped kerb permit if changing the driveway access',
    ],
    keyDecisions: [
      { title: 'Driveway material', why: 'Affects drainage planning and ground preparation', leadTime: '2-4 weeks' },
      { title: 'External lighting', why: 'Cabling should be installed before landscaping', leadTime: '1-2 weeks' },
      { title: 'Fencing and boundary treatment', why: 'Check planning conditions for permitted heights and materials', leadTime: '1-3 weeks' },
    ],
  },
  'Testing': {
    summary:
      'Airtightness testing, electrical certification, gas safe certificates, EPC, and final building control inspections.',
    whatToFocus: [
      'Book airtightness test — seal all gaps first (around pipes, cables, windows)',
      'Obtain electrical installation certificate (Part P)',
      'Get gas safety certificate for boiler / hob',
      'Commission MVHR system and balance airflows',
      'Book EPC assessment',
    ],
    tips: [
      { content: 'Do a pre-airtightness check by pressurising the building and walking around with a smoke pen — fix leaks before the official test.', importance: 'high' },
      { content: 'Collect all certificates and test results in one folder — building control will want everything at final inspection.', importance: 'high' },
      { content: 'Test every window opens and closes properly, every lock works, every tap runs clear.', importance: 'medium' },
    ],
    commonMistakes: [
      'Failing the airtightness test due to unsealed service penetrations',
      'Not having Part P electrical certificate — this is a legal requirement',
      'Forgetting to commission the heating system properly (balancing radiators / UFH)',
      'Missing the as-built SAP calculation needed for Building Regs completion',
    ],
    keyDecisions: [
      { title: 'Airtightness tester', why: 'Book well in advance — good testers are busy', leadTime: '2-4 weeks' },
      { title: 'EPC assessor', why: 'Required for Building Regs completion certificate', leadTime: '1-2 weeks' },
    ],
  },
  'Completion': {
    summary:
      'Snagging, final sign-offs, building control completion certificate, and moving in. The finish line.',
    whatToFocus: [
      'Complete a thorough snagging survey of every room',
      'Obtain building control completion certificate',
      'Submit CIL Form 7 Part 2 (self-build exemption final claim)',
      'Submit VAT reclaim (VAT431B) within 3 months of completion certificate',
      'Collect all guarantees, warranties, and O&M manuals',
    ],
    tips: [
      { content: 'Hire a professional snagger — they will find 3x more issues than you will. It costs around 300-500 and is worth every penny.', importance: 'high' },
      { content: 'Do not move furniture in until all snagging is complete — access is easier with empty rooms.', importance: 'medium' },
      { content: 'Submit your VAT reclaim promptly — you only get one chance and the 3-month deadline is strict.', importance: 'high' },
      { content: 'Take final "after" photos of every room for your records and for the mortgage valuer.', importance: 'low' },
    ],
    commonMistakes: [
      'Missing the 3-month VAT reclaim deadline — you lose thousands of pounds',
      'Forgetting to submit CIL Form 7 Part 2 — you may have to pay the full CIL charge',
      'Not obtaining the building control completion certificate — affects property value and insurance',
      'Signing off contractor final payments before snagging is complete',
    ],
    keyDecisions: [
      { title: 'Professional snagger', why: 'Should inspect before final contractor payments', leadTime: '1-2 weeks' },
      { title: 'VAT reclaim preparation', why: 'Strict 3-month deadline from completion certificate', leadTime: '1-2 weeks' },
    ],
  },
};

export function getPhaseGuidance(phaseName: string): PhaseGuidance | null {
  // Try exact match first
  if (PHASE_GUIDANCE[phaseName]) {
    return PHASE_GUIDANCE[phaseName];
  }

  // Try matching by phase letter prefix (e.g. "A: Pre-Construction" -> "Pre-Construction")
  const nameOnly = phaseName.replace(/^[A-Z]:\s*/, '').trim();
  if (PHASE_GUIDANCE[nameOnly]) {
    return PHASE_GUIDANCE[nameOnly];
  }

  // Try fuzzy match on the end of the name
  for (const [key, value] of Object.entries(PHASE_GUIDANCE)) {
    if (phaseName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

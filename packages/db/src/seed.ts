import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  phases,
  tasks,
  budgetCategories,
  cilSteps,
  inspections,
  contacts,
} from './schema';

type DrizzleInstance = PostgresJsDatabase<Record<string, never>>;

// ─── Phase Definitions ──────────────────────────────────────────────────────

const PHASES = [
  { name: 'Phase A: Pre-Construction', sortOrder: 0 },
  { name: 'Phase B: Site Preparation & Groundworks', sortOrder: 1 },
  { name: 'Phase C: Foundations', sortOrder: 2 },
  { name: 'Phase D: Superstructure', sortOrder: 3 },
  { name: 'Phase E: Roof', sortOrder: 4 },
  { name: 'Phase F: First Fix', sortOrder: 5 },
  { name: 'Phase G: Plastering & Drying', sortOrder: 6 },
  { name: 'Phase H: Second Fix & Finishes', sortOrder: 7 },
  { name: 'Phase I: External Works', sortOrder: 8 },
  { name: 'Phase J: Testing & Sign-Off', sortOrder: 9 },
  { name: 'Phase K: Completion Admin & Move-In', sortOrder: 10 },
] as const;

// ─── Task Definitions ───────────────────────────────────────────────────────

interface TaskDef {
  title: string;
  isMilestone?: boolean;
  inspectionRequired?: boolean;
}

const TASKS_BY_PHASE: Record<string, TaskDef[]> = {
  'Phase A: Pre-Construction': [
    { title: 'Submit planning application' },
    { title: 'Planning decision received', isMilestone: true },
    { title: 'Discharge pre-commencement conditions' },
    { title: 'Submit building regulations' },
    { title: 'Building regulations approved' },
    { title: 'CIL: Submit Form 2' },
    { title: 'CIL: Submit Form 7 Part 1' },
    { title: 'CIL: Submit Form 6' },
    { title: 'Arrange structural warranty' },
    { title: 'Arrange site insurance' },
    { title: 'Apply for water connection' },
    { title: 'Apply for electricity connection' },
    { title: 'Appoint builder / main contractor' },
    { title: 'Sign building contract' },
    { title: 'Notify building control of commencement' },
  ],
  'Phase B: Site Preparation & Groundworks': [
    { title: 'Site clearance / demolition' },
    { title: 'Setting out' },
    { title: 'Excavation for foundations', inspectionRequired: true },
    { title: 'Below-ground drainage runs', inspectionRequired: true },
  ],
  'Phase C: Foundations': [
    { title: 'Pour foundation concrete', inspectionRequired: true },
    { title: 'Blockwork substructure walls', inspectionRequired: true },
    { title: 'Hardcore, DPM, insulation for slab', inspectionRequired: true },
    { title: 'Pour ground floor slab' },
  ],
  'Phase D: Superstructure': [
    { title: 'External walls — ground floor' },
    { title: 'First floor structure', inspectionRequired: true },
    { title: 'Structural steelwork', inspectionRequired: true },
    { title: 'External walls — first floor' },
    { title: 'Second floor structure', inspectionRequired: true },
    { title: 'External walls — loft level' },
    { title: 'Window and external door installation' },
  ],
  'Phase E: Roof': [
    { title: 'Roof structure', inspectionRequired: true },
    { title: 'Roof covering' },
    { title: 'Fascias, soffits, guttering' },
    { title: 'WEATHERTIGHT milestone', isMilestone: true },
  ],
  'Phase F: First Fix': [
    { title: 'Carpentry first fix' },
    { title: 'Electrical first fix' },
    { title: 'Plumbing first fix' },
    { title: 'Heating first fix' },
    { title: 'Insulation' },
    { title: 'Fire stopping' },
    { title: 'Pre-plaster inspection', inspectionRequired: true },
  ],
  'Phase G: Plastering & Drying': [
    { title: 'Plasterboard fixing' },
    { title: 'Skim coat plastering' },
    { title: 'Floor screed' },
    { title: 'Drying out period' },
  ],
  'Phase H: Second Fix & Finishes': [
    { title: 'Carpentry second fix' },
    { title: 'Electrical second fix', inspectionRequired: true },
    { title: 'Plumbing second fix' },
    { title: 'Boiler installation', inspectionRequired: true },
    { title: 'Kitchen installation' },
    { title: 'Bathroom tiling' },
    { title: 'Decoration' },
    { title: 'Flooring' },
  ],
  'Phase I: External Works': [
    { title: 'Driveway construction' },
    { title: 'Landscaping' },
    { title: 'Fencing' },
    { title: 'Final drainage', inspectionRequired: true },
    { title: 'Scaffold removal' },
  ],
  'Phase J: Testing & Sign-Off': [
    { title: 'Air tightness test' },
    { title: 'As-built SAP calculation' },
    { title: 'EPC' },
    { title: 'Compile certificates' },
    { title: 'Building control final inspection', inspectionRequired: true },
    { title: 'Completion Certificate issued', isMilestone: true },
    { title: 'Warranty final inspection' },
    { title: '10-year structural warranty issued' },
  ],
  'Phase K: Completion Admin & Move-In': [
    { title: 'Full snagging walkthrough' },
    { title: 'Register for council tax' },
    { title: 'Submit VAT reclaim' },
    { title: 'Submit CIL Form 7 Part 2' },
    { title: 'Arrange buildings insurance' },
    { title: 'Move in!', isMilestone: true },
  ],
};

// ─── Budget Category Definitions ────────────────────────────────────────────

const BUDGET_CATEGORIES = [
  { name: 'Professional Fees', typicalPct: '12.00', sortOrder: 0 },
  { name: 'Statutory & Regulatory', typicalPct: '2.50', sortOrder: 1 },
  { name: 'Groundworks & Foundations', typicalPct: '12.00', sortOrder: 2 },
  { name: 'Superstructure', typicalPct: '30.00', sortOrder: 3 },
  { name: 'Roof', typicalPct: '10.00', sortOrder: 4 },
  { name: 'First Fix', typicalPct: '17.00', sortOrder: 5 },
  { name: 'Plastering & Screeding', typicalPct: '4.00', sortOrder: 6 },
  { name: 'Second Fix & Finishes', typicalPct: '25.00', sortOrder: 7 },
  { name: 'External Works', typicalPct: '10.00', sortOrder: 8 },
  { name: 'Utilities & Connections', typicalPct: '4.00', sortOrder: 9 },
  { name: 'Insurance & Warranty', typicalPct: '1.50', sortOrder: 10 },
  { name: 'Site Costs', typicalPct: '3.00', sortOrder: 11 },
  { name: 'Contingency', typicalPct: '15.00', sortOrder: 12 },
] as const;

// ─── CIL Step Definitions ───────────────────────────────────────────────────

const CIL_STEPS = [
  {
    stepNumber: 1,
    formName: 'Form 2',
    description: 'Assumption of Liability',
    isBlocking: false,
  },
  {
    stepNumber: 2,
    formName: 'Liability Notice',
    description: 'Receive Liability Notice',
    isBlocking: false,
  },
  {
    stepNumber: 3,
    formName: 'Form 7 Part 1',
    description: 'Self-Build Exemption',
    isBlocking: true,
  },
  {
    stepNumber: 4,
    formName: 'Exemption Confirmation',
    description: 'Receive written exemption confirmation',
    isBlocking: true,
  },
  {
    stepNumber: 5,
    formName: 'Form 6',
    description: 'Commencement Notice',
    isBlocking: true,
  },
  {
    stepNumber: 6,
    formName: 'Form 7 Part 2',
    description: 'Post-completion evidence',
    isBlocking: false,
  },
] as const;

// ─── Inspection Definitions ─────────────────────────────────────────────────

interface InspectionDef {
  name: string;
  type: string;
  linkedTaskTitle?: string;
  sortOrder: number;
}

const INSPECTIONS: InspectionDef[] = [
  { name: 'Commencement notification', type: 'building_control', linkedTaskTitle: 'Notify building control of commencement', sortOrder: 0 },
  { name: 'Excavation inspection', type: 'building_control', linkedTaskTitle: 'Excavation for foundations', sortOrder: 1 },
  { name: 'Foundation concrete', type: 'building_control', linkedTaskTitle: 'Pour foundation concrete', sortOrder: 2 },
  { name: 'Oversite preparation', type: 'building_control', linkedTaskTitle: 'Hardcore, DPM, insulation for slab', sortOrder: 3 },
  { name: 'DPC inspection', type: 'building_control', linkedTaskTitle: 'Blockwork substructure walls', sortOrder: 4 },
  { name: 'Drainage inspection', type: 'building_control', linkedTaskTitle: 'Below-ground drainage runs', sortOrder: 5 },
  { name: 'Floor structure', type: 'building_control', linkedTaskTitle: 'First floor structure', sortOrder: 6 },
  { name: 'Steelwork inspection', type: 'building_control', linkedTaskTitle: 'Structural steelwork', sortOrder: 7 },
  { name: 'Roof structure', type: 'building_control', linkedTaskTitle: 'Roof structure', sortOrder: 8 },
  { name: 'Pre-plaster', type: 'building_control', linkedTaskTitle: 'Pre-plaster inspection', sortOrder: 9 },
  { name: 'Final drain test', type: 'building_control', linkedTaskTitle: 'Final drainage', sortOrder: 10 },
  { name: 'Pre-occupation', type: 'building_control', sortOrder: 11 },
  { name: 'Final completion', type: 'building_control', linkedTaskTitle: 'Building control final inspection', sortOrder: 12 },
  { name: 'Foundation inspection', type: 'warranty', linkedTaskTitle: 'Pour foundation concrete', sortOrder: 13 },
  { name: 'Superstructure inspection', type: 'warranty', sortOrder: 14 },
  { name: 'Pre-plaster inspection', type: 'warranty', linkedTaskTitle: 'Pre-plaster inspection', sortOrder: 15 },
  { name: 'Completion inspection', type: 'warranty', linkedTaskTitle: 'Building control final inspection', sortOrder: 16 },
];

// ─── Contact Definitions ────────────────────────────────────────────────────

const CONTACTS = [
  {
    name: 'Barnet Building Control',
    role: 'building_control',
    phone: '020 8359 4500',
    email: 'building.control@barnet.gov.uk',
    isPinned: true,
  },
  {
    name: 'Barnet Planning',
    role: 'planning',
    email: 'via Public Access portal',
    isPinned: true,
  },
  {
    name: 'Barnet CIL Team',
    role: 'planning',
    email: 'CIL@barnet.gov.uk',
    isPinned: false,
  },
  {
    name: 'Barnet Highways',
    role: 'highways',
    phone: '020 8359 3555',
    email: 'highwayscorrespondence@barnet.gov.uk',
    isPinned: false,
  },
  {
    name: 'Barnet Street Naming',
    role: 'admin',
    phone: '020 8359 3555',
    email: 'highwayscorrespondence@barnet.gov.uk',
    isPinned: false,
  },
  {
    name: 'Barnet Council Tax',
    role: 'admin',
    email: 'inspectors@barnet.gov.uk',
    isPinned: false,
  },
] as const;

// ─── Seed Function ──────────────────────────────────────────────────────────

export async function seedProject(
  db: DrizzleInstance,
  projectId: string,
): Promise<void> {
  // 1. Insert phases and get their IDs
  const insertedPhases = await db
    .insert(phases)
    .values(
      PHASES.map((p) => ({
        projectId,
        name: p.name,
        sortOrder: p.sortOrder,
        status: 'not_started' as const,
      })),
    )
    .returning({ id: phases.id, name: phases.name });

  // Build a lookup: phase name → phase ID
  const phaseIdByName = new Map<string, string>();
  for (const p of insertedPhases) {
    phaseIdByName.set(p.name, p.id);
  }

  // 2. Insert tasks for each phase, collecting inserted tasks for inspection linking
  const allInsertedTasks: { id: string; title: string }[] = [];

  for (const [phaseName, taskDefs] of Object.entries(TASKS_BY_PHASE)) {
    const phaseId = phaseIdByName.get(phaseName);
    if (!phaseId) continue;

    const insertedTasks = await db
      .insert(tasks)
      .values(
        taskDefs.map((t, idx) => ({
          phaseId,
          title: t.title,
          status: 'not_started' as const,
          isMilestone: t.isMilestone ?? false,
          inspectionRequired: t.inspectionRequired ?? false,
          sortOrder: idx,
        })),
      )
      .returning({ id: tasks.id, title: tasks.title });

    allInsertedTasks.push(...insertedTasks);
  }

  // Build a lookup: task title → task ID
  const taskIdByTitle = new Map<string, string>();
  for (const t of allInsertedTasks) {
    taskIdByTitle.set(t.title, t.id);
  }

  // 3. Insert budget categories
  await db.insert(budgetCategories).values(
    BUDGET_CATEGORIES.map((bc) => ({
      projectId,
      name: bc.name,
      typicalPct: bc.typicalPct,
      sortOrder: bc.sortOrder,
    })),
  );

  // 4. Insert CIL steps
  await db.insert(cilSteps).values(
    CIL_STEPS.map((cs) => ({
      projectId,
      stepNumber: cs.stepNumber,
      formName: cs.formName,
      description: cs.description,
      status: 'not_started' as const,
      isBlocking: cs.isBlocking,
    })),
  );

  // 5. Insert inspections, linking to tasks where applicable
  await db.insert(inspections).values(
    INSPECTIONS.map((insp) => ({
      projectId,
      name: insp.name,
      type: insp.type,
      linkedTaskId: insp.linkedTaskTitle
        ? taskIdByTitle.get(insp.linkedTaskTitle) ?? null
        : null,
      status: 'not_needed' as const,
      isCustom: false,
      sortOrder: insp.sortOrder,
    })),
  );

  // 6. Insert Barnet council contacts
  await db.insert(contacts).values(
    CONTACTS.map((c) => ({
      projectId,
      name: c.name,
      role: c.role,
      phone: 'phone' in c ? c.phone : null,
      email: c.email,
      isPinned: c.isPinned,
    })),
  );
}

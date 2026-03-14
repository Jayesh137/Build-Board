import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  numeric,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  localAuthority: text('local_authority').notNull().default('London Borough of Barnet'),
  totalBudget: integer('total_budget'),
  contingencyPct: integer('contingency_pct').default(15),
  startDate: date('start_date'),
  targetCompletion: date('target_completion'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Project Members ─────────────────────────────────────────────────────────

export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: text('role').notNull(),
    modules: text('modules').array(),
    invitedAt: timestamp('invited_at', { withTimezone: true }).defaultNow(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('project_members_project_user_idx').on(table.projectId, table.userId),
  ],
);

// ─── Phases ──────────────────────────────────────────────────────────────────

export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull(),
  status: text('status').notNull().default('not_started'),
  startDate: date('start_date'),
  endDate: date('end_date'),
});

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  phaseId: uuid('phase_id').references(() => phases.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('not_started'),
  assigneeId: uuid('assignee_id'),
  startDate: date('start_date'),
  dueDate: date('due_date'),
  actualStart: date('actual_start'),
  actualEnd: date('actual_end'),
  isMilestone: boolean('is_milestone').default(false),
  inspectionRequired: boolean('inspection_required').default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Task Dependencies ──────────────────────────────────────────────────────

export const taskDependencies = pgTable(
  'task_dependencies',
  {
    taskId: uuid('task_id').notNull(),
    dependsOnId: uuid('depends_on_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.dependsOnId] }),
  ],
);

// ─── Budget Categories ──────────────────────────────────────────────────────

export const budgetCategories = pgTable('budget_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  allocatedAmount: integer('allocated_amount'),
  typicalPct: numeric('typical_pct', { precision: 5, scale: 2 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

// ─── Budget Entries ─────────────────────────────────────────────────────────

export const budgetEntries = pgTable('budget_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => budgetCategories.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  supplier: text('supplier'),
  description: text('description'),
  amount: integer('amount').notNull(),
  vatAmount: integer('vat_amount').default(0),
  date: date('date').notNull(),
  status: text('status').notNull().default('pending'),
  receiptPath: text('receipt_path'),
  linkedQuoteId: uuid('linked_quote_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── VAT Entries ────────────────────────────────────────────────────────────

export const vatEntries = pgTable('vat_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  budgetEntryId: uuid('budget_entry_id'),
  invoiceNumber: text('invoice_number'),
  supplierName: text('supplier_name').notNull(),
  supplierVatNumber: text('supplier_vat_number'),
  description: text('description').notNull(),
  netAmount: integer('net_amount').notNull(),
  vatAmount: integer('vat_amount').notNull(),
  invoiceTotal: integer('invoice_total').notNull(),
  invoiceDate: date('invoice_date').notNull(),
  source: text('source').notNull(),
  reclaimable: text('reclaimable').notNull().default('needs_review'),
  hasClaimantNameAddress: boolean('has_claimant_name_address'),
  receiptPath: text('receipt_path'),
  validated: boolean('validated').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Planning Conditions ────────────────────────────────────────────────────

export const planningConditions = pgTable('planning_conditions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  conditionNumber: integer('condition_number').notNull(),
  description: text('description').notNull(),
  conditionType: text('condition_type').notNull(),
  status: text('status').notNull().default('not_started'),
  submissionDate: date('submission_date'),
  decisionDate: date('decision_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── CIL Steps ──────────────────────────────────────────────────────────────

export const cilSteps = pgTable('cil_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  formName: text('form_name').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('not_started'),
  submittedDate: date('submitted_date'),
  confirmedDate: date('confirmed_date'),
  deadline: date('deadline'),
  isBlocking: boolean('is_blocking').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Documents ──────────────────────────────────────────────────────────────

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  folder: text('folder').notNull(),
  name: text('name').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  tags: text('tags').array(),
  uploadedBy: uuid('uploaded_by'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow(),
  version: integer('version').default(1),
});

// ─── Contacts ───────────────────────────────────────────────────────────────

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  website: text('website'),
  notes: text('notes'),
  insuranceExpiry: date('insurance_expiry'),
  qualifications: text('qualifications'),
  contractValue: integer('contract_value'),
  rating: integer('rating'),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Decisions ──────────────────────────────────────────────────────────────

export const decisions = pgTable('decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category'),
  status: text('status').notNull().default('not_started'),
  deadline: date('deadline'),
  leadTimeDays: integer('lead_time_days'),
  orderByDate: date('order_by_date'),
  decidedDate: date('decided_date'),
  decidedBy: uuid('decided_by'),
  linkedTaskId: uuid('linked_task_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Decision Options ───────────────────────────────────────────────────────

export const decisionOptions = pgTable('decision_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  decisionId: uuid('decision_id').references(() => decisions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  supplier: text('supplier'),
  cost: integer('cost'),
  pros: text('pros'),
  cons: text('cons'),
  isChosen: boolean('is_chosen').default(false),
  sortOrder: integer('sort_order').default(0),
});

// ─── Inspections ────────────────────────────────────────────────────────────

export const inspections = pgTable('inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  linkedTaskId: uuid('linked_task_id'),
  status: text('status').notNull().default('not_needed'),
  scheduledDate: date('scheduled_date'),
  resultNotes: text('result_notes'),
  inspector: text('inspector'),
  isCustom: boolean('is_custom').default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Diary Entries ──────────────────────────────────────────────────────────

export const diaryEntries = pgTable(
  'diary_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    entryDate: date('entry_date').notNull(),
    weatherTemp: text('weather_temp'),
    weatherConditions: text('weather_conditions'),
    weatherWind: text('weather_wind'),
    workersOnSite: text('workers_on_site').array(),
    workCompleted: text('work_completed'),
    issues: text('issues'),
    deliveries: text('deliveries'),
    visitors: text('visitors'),
    healthSafety: text('health_safety'),
    notes: text('notes'),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('diary_entries_project_date_idx').on(table.projectId, table.entryDate),
  ],
);

// ─── Photos ─────────────────────────────────────────────────────────────────

export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  diaryEntryId: uuid('diary_entry_id'),
  filePath: text('file_path').notNull(),
  thumbnailPath: text('thumbnail_path'),
  takenAt: timestamp('taken_at', { withTimezone: true }).defaultNow(),
  room: text('room'),
  phase: text('phase'),
  trade: text('trade'),
  photoType: text('photo_type'),
  tags: text('tags').array(),
  uploadedBy: uuid('uploaded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Snags ──────────────────────────────────────────────────────────────────

export const snags = pgTable('snags', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  room: text('room'),
  category: text('category'),
  severity: text('severity'),
  description: text('description'),
  photoIds: uuid('photo_ids').array(),
  responsibleContact: uuid('responsible_contact'),
  dateFound: date('date_found').notNull().defaultNow(),
  deadline: date('deadline'),
  status: text('status').notNull().default('open'),
  resolutionPhotoIds: uuid('resolution_photo_ids').array(),
  resolutionDate: date('resolution_date'),
  resolutionNotes: text('resolution_notes'),
  verifiedBy: uuid('verified_by'),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Activity Log ───────────────────────────────────────────────────────────

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  module: text('module').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  summary: text('summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

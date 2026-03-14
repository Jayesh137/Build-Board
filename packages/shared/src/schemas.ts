import { z } from 'zod';

// --- Task ---

export const createTaskSchema = z.object({
  phaseId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigneeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  isMilestone: z.boolean().default(false),
  inspectionRequired: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'blocked', 'done']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  actualStart: z.string().nullable().optional(),
  actualEnd: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// --- Budget Entry ---

export const createBudgetEntrySchema = z.object({
  categoryId: z.string().uuid(),
  type: z.enum(['quote', 'invoice', 'payment']),
  supplier: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().int(),
  vatAmount: z.number().int().default(0),
  date: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected', 'paid', 'partially_paid']).default('pending'),
  receiptPath: z.string().optional(),
  linkedQuoteId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const updateBudgetEntrySchema = z.object({
  type: z.enum(['quote', 'invoice', 'payment']).optional(),
  supplier: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  amount: z.number().int().optional(),
  vatAmount: z.number().int().optional(),
  date: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'paid', 'partially_paid']).optional(),
  receiptPath: z.string().nullable().optional(),
  linkedQuoteId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// --- VAT Entry ---

export const createVATEntrySchema = z.object({
  projectId: z.string().uuid(),
  budgetEntryId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  supplierName: z.string().min(1),
  supplierVatNumber: z.string().optional(),
  description: z.string().min(1),
  netAmount: z.number().int(),
  vatAmount: z.number().int(),
  invoiceTotal: z.number().int(),
  invoiceDate: z.string(),
  source: z.enum(['direct_purchase', 'contractor_zero_rated', 'contractor_vat_error']),
  reclaimable: z.enum(['yes', 'no', 'needs_review']).default('needs_review'),
  hasClaimantNameAddress: z.boolean().optional(),
  receiptPath: z.string().optional(),
  notes: z.string().optional(),
});

export const updateVATEntrySchema = z.object({
  invoiceNumber: z.string().nullable().optional(),
  supplierName: z.string().min(1).optional(),
  supplierVatNumber: z.string().nullable().optional(),
  description: z.string().min(1).optional(),
  netAmount: z.number().int().optional(),
  vatAmount: z.number().int().optional(),
  invoiceTotal: z.number().int().optional(),
  invoiceDate: z.string().optional(),
  source: z.enum(['direct_purchase', 'contractor_zero_rated', 'contractor_vat_error']).optional(),
  reclaimable: z.enum(['yes', 'no', 'needs_review']).optional(),
  hasClaimantNameAddress: z.boolean().nullable().optional(),
  receiptPath: z.string().nullable().optional(),
  validated: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

// --- Contact ---

export const createContactSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  role: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  qualifications: z.string().optional(),
  contractValue: z.number().int().optional(),
  rating: z.number().min(1).max(5).optional(),
  isPinned: z.boolean().default(false),
});

export const updateContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  insuranceExpiry: z.string().nullable().optional(),
  qualifications: z.string().nullable().optional(),
  contractValue: z.number().int().nullable().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  isPinned: z.boolean().optional(),
});

// --- Decision ---

export const createDecisionSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(500),
  category: z.string().optional(),
  deadline: z.string().optional(),
  leadTimeDays: z.number().int().optional(),
  linkedTaskId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const createDecisionOptionSchema = z.object({
  decisionId: z.string().uuid(),
  name: z.string().min(1).max(300),
  supplier: z.string().optional(),
  cost: z.number().int().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  isChosen: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// --- Snag ---

export const createSnagSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(500),
  room: z.string().optional(),
  category: z.enum(['structural', 'cosmetic', 'functional', 'safety']).optional(),
  severity: z.enum(['critical', 'major', 'minor']).optional(),
  description: z.string().optional(),
  photoIds: z.array(z.string().uuid()).optional(),
  responsibleContact: z.string().uuid().optional(),
  dateFound: z.string(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSnagSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  room: z.string().nullable().optional(),
  category: z.enum(['structural', 'cosmetic', 'functional', 'safety']).nullable().optional(),
  severity: z.enum(['critical', 'major', 'minor']).nullable().optional(),
  description: z.string().nullable().optional(),
  photoIds: z.array(z.string().uuid()).nullable().optional(),
  responsibleContact: z.string().uuid().nullable().optional(),
  deadline: z.string().nullable().optional(),
  status: z.enum(['open', 'assigned', 'in_progress', 'fixed', 'verified']).optional(),
  resolutionPhotoIds: z.array(z.string().uuid()).nullable().optional(),
  resolutionDate: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  verifiedBy: z.string().uuid().nullable().optional(),
});

// --- Diary Entry ---

export const createDiaryEntrySchema = z.object({
  projectId: z.string().uuid(),
  entryDate: z.string(),
  weatherTemp: z.string().optional(),
  weatherConditions: z.string().optional(),
  weatherWind: z.string().optional(),
  workersOnSite: z.array(z.string()).optional(),
  workCompleted: z.string().optional(),
  issues: z.string().optional(),
  deliveries: z.string().optional(),
  visitors: z.string().optional(),
  healthSafety: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDiaryEntrySchema = z.object({
  entryDate: z.string().optional(),
  weatherTemp: z.string().nullable().optional(),
  weatherConditions: z.string().nullable().optional(),
  weatherWind: z.string().nullable().optional(),
  workersOnSite: z.array(z.string()).nullable().optional(),
  workCompleted: z.string().nullable().optional(),
  issues: z.string().nullable().optional(),
  deliveries: z.string().nullable().optional(),
  visitors: z.string().nullable().optional(),
  healthSafety: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// --- Planning Condition ---

export const createPlanningConditionSchema = z.object({
  projectId: z.string().uuid(),
  conditionNumber: z.number().int().positive(),
  description: z.string().min(1),
  conditionType: z.enum(['pre_commencement', 'pre_occupation', 'ongoing', 'informative']),
  notes: z.string().optional(),
});

// --- CIL Step ---

export const updateCILStepSchema = z.object({
  status: z.enum(['not_started', 'submitted', 'confirmed', 'overdue']).optional(),
  submittedDate: z.string().nullable().optional(),
  confirmedDate: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// --- Inspection ---

export const createInspectionSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(300),
  type: z.enum(['building_control', 'warranty', 'other']),
  linkedTaskId: z.string().uuid().optional(),
  status: z.enum(['not_needed', 'due', 'booked', 'passed', 'conditional', 'failed']).default('due'),
  scheduledDate: z.string().optional(),
  inspector: z.string().optional(),
  isCustom: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const updateInspectionSchema = z.object({
  name: z.string().min(1).max(300).optional(),
  type: z.enum(['building_control', 'warranty', 'other']).optional(),
  linkedTaskId: z.string().uuid().nullable().optional(),
  status: z.enum(['not_needed', 'due', 'booked', 'passed', 'conditional', 'failed']).optional(),
  scheduledDate: z.string().nullable().optional(),
  resultNotes: z.string().nullable().optional(),
  inspector: z.string().nullable().optional(),
});

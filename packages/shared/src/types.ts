export type AlertPriority = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  priority: AlertPriority;
  module: string;
  title: string;
  description: string;
  link?: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  localAuthority: string;
  totalBudget: number | null;
  contingencyPct: number;
  startDate: string | null;
  targetCompletion: string | null;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'collaborator' | 'viewer';
  modules: string[] | null;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  sortOrder: number;
  status: 'not_started' | 'in_progress' | 'done';
  startDate: string | null;
  endDate: string | null;
}

export interface Task {
  id: string;
  phaseId: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'blocked' | 'done';
  assigneeId: string | null;
  startDate: string | null;
  dueDate: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  isMilestone: boolean;
  inspectionRequired: boolean;
  sortOrder: number;
  notes: string | null;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  projectId: string;
  name: string;
  allocatedAmount: number | null;
  typicalPct: number | null;
  sortOrder: number;
}

export interface BudgetEntry {
  id: string;
  categoryId: string;
  type: 'quote' | 'invoice' | 'payment';
  supplier: string | null;
  description: string | null;
  amount: number;
  vatAmount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'partially_paid';
  receiptPath: string | null;
  linkedQuoteId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface VATEntry {
  id: string;
  projectId: string;
  budgetEntryId: string | null;
  invoiceNumber: string | null;
  supplierName: string;
  supplierVatNumber: string | null;
  description: string;
  netAmount: number;
  vatAmount: number;
  invoiceTotal: number;
  invoiceDate: string;
  source: 'direct_purchase' | 'contractor_zero_rated' | 'contractor_vat_error';
  reclaimable: 'yes' | 'no' | 'needs_review';
  hasClaimantNameAddress: boolean | null;
  receiptPath: string | null;
  validated: boolean;
  notes: string | null;
  createdAt: string;
}

export interface PlanningCondition {
  id: string;
  projectId: string;
  conditionNumber: number;
  description: string;
  conditionType: 'pre_commencement' | 'pre_occupation' | 'ongoing' | 'informative';
  status: 'not_started' | 'submitted' | 'discharged' | 'partially_discharged';
  submissionDate: string | null;
  decisionDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CILStepRecord {
  id: string;
  projectId: string;
  stepNumber: number;
  formName: string;
  description: string;
  status: 'not_started' | 'submitted' | 'confirmed' | 'overdue';
  submittedDate: string | null;
  confirmedDate: string | null;
  deadline: string | null;
  isBlocking: boolean;
  notes: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  folder: string;
  name: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  tags: string[] | null;
  uploadedBy: string | null;
  uploadedAt: string;
  version: number;
}

export interface Contact {
  id: string;
  projectId: string;
  name: string;
  role: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  insuranceExpiry: string | null;
  qualifications: string | null;
  contractValue: number | null;
  rating: number | null;
  isPinned: boolean;
  createdAt: string;
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  category: string | null;
  status: 'not_started' | 'researching' | 'shortlisted' | 'decided' | 'ordered';
  deadline: string | null;
  leadTimeDays: number | null;
  orderByDate: string | null;
  decidedDate: string | null;
  decidedBy: string | null;
  linkedTaskId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DecisionOption {
  id: string;
  decisionId: string;
  name: string;
  supplier: string | null;
  cost: number | null;
  pros: string | null;
  cons: string | null;
  isChosen: boolean;
  sortOrder: number;
}

export interface Inspection {
  id: string;
  projectId: string;
  name: string;
  type: 'building_control' | 'warranty' | 'other';
  linkedTaskId: string | null;
  status: 'not_needed' | 'due' | 'booked' | 'passed' | 'conditional' | 'failed';
  scheduledDate: string | null;
  resultNotes: string | null;
  inspector: string | null;
  isCustom: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  projectId: string;
  entryDate: string;
  weatherTemp: string | null;
  weatherConditions: string | null;
  weatherWind: string | null;
  workersOnSite: string[] | null;
  workCompleted: string | null;
  issues: string | null;
  deliveries: string | null;
  visitors: string | null;
  healthSafety: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  projectId: string;
  diaryEntryId: string | null;
  filePath: string;
  thumbnailPath: string | null;
  takenAt: string;
  room: string | null;
  phase: string | null;
  trade: string | null;
  photoType: 'progress' | 'concealed' | 'issue' | 'delivery' | 'inspection' | 'snag' | null;
  tags: string[] | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface Snag {
  id: string;
  projectId: string;
  title: string;
  room: string | null;
  category: 'structural' | 'cosmetic' | 'functional' | 'safety' | null;
  severity: 'critical' | 'major' | 'minor' | null;
  description: string | null;
  photoIds: string[] | null;
  responsibleContact: string | null;
  dateFound: string;
  deadline: string | null;
  status: 'open' | 'assigned' | 'in_progress' | 'fixed' | 'verified';
  resolutionPhotoIds: string[] | null;
  resolutionDate: string | null;
  resolutionNotes: string | null;
  verifiedBy: string | null;
  shareToken: string | null;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  userId: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  summary: string | null;
  createdAt: string;
}

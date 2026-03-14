import { sql } from './db';

const PROJECT_ID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';

export async function getProject() {
  if (!sql) return null;
  const [p] = await sql`SELECT * FROM projects WHERE id = ${PROJECT_ID}`;
  if (!p) return null;
  return {
    ...p,
    localAuthority: p.local_authority,
    totalBudget: p.total_budget,
    contingencyPct: p.contingency_pct,
    startDate: p.start_date,
    targetCompletion: p.target_completion,
    createdAt: p.created_at,
  };
}

export async function getPhases() {
  if (!sql) return [];
  const allPhases = await sql`SELECT id, project_id, name, sort_order, status, start_date::text, end_date::text FROM phases WHERE project_id = ${PROJECT_ID} ORDER BY sort_order`;
  const allTasks = await sql`SELECT id, phase_id, title, description, status, assignee_id, start_date::text, due_date::text, actual_start::text, actual_end::text, is_milestone, inspection_required, sort_order, notes, created_at FROM tasks WHERE phase_id IN (SELECT id FROM phases WHERE project_id = ${PROJECT_ID}) ORDER BY sort_order`;
  return allPhases.map((phase: any) => ({
    ...phase,
    // Map snake_case to camelCase for frontend compatibility
    projectId: phase.project_id,
    sortOrder: phase.sort_order,
    startDate: phase.start_date,
    endDate: phase.end_date,
    tasks: allTasks
      .filter((t: any) => t.phase_id === phase.id)
      .map((t: any) => ({
        ...t,
        phaseId: t.phase_id,
        assigneeId: t.assignee_id,
        dueDate: t.due_date,
        startDate: t.start_date,
        actualStart: t.actual_start,
        actualEnd: t.actual_end,
        isMilestone: t.is_milestone,
        inspectionRequired: t.inspection_required,
        sortOrder: t.sort_order,
        createdAt: t.created_at,
      })),
  }));
}

export async function getBudgetCategories() {
  if (!sql) return [];
  const rows = await sql`SELECT * FROM budget_categories WHERE project_id = ${PROJECT_ID} ORDER BY sort_order`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    allocatedAmount: r.allocated_amount,
    typicalPct: r.typical_pct,
    sortOrder: r.sort_order,
  }));
}

export async function getContacts() {
  if (!sql) return [];
  const rows = await sql`SELECT id, project_id, name, role, company, phone, email, address, website, notes, insurance_expiry::text, qualifications, contract_value, rating, is_pinned, created_at FROM contacts WHERE project_id = ${PROJECT_ID} ORDER BY is_pinned DESC, name ASC`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    insuranceExpiry: r.insurance_expiry,
    contractValue: r.contract_value,
    isPinned: r.is_pinned,
    createdAt: r.created_at,
  }));
}

export async function getDecisions() {
  if (!sql) return [];
  const allDecisions = await sql`SELECT id, project_id, title, category, status, deadline::text, lead_time_days, order_by_date::text, decided_date::text, decided_by, linked_task_id, notes, created_at FROM decisions WHERE project_id = ${PROJECT_ID} ORDER BY deadline ASC NULLS LAST`;
  const allOptions = await sql`SELECT * FROM decision_options WHERE decision_id IN (SELECT id FROM decisions WHERE project_id = ${PROJECT_ID})`;
  return allDecisions.map((d: any) => ({
    ...d,
    projectId: d.project_id,
    leadTimeDays: d.lead_time_days,
    orderByDate: d.order_by_date,
    decidedDate: d.decided_date,
    decidedBy: d.decided_by,
    linkedTaskId: d.linked_task_id,
    createdAt: d.created_at,
    options: allOptions
      .filter((o: any) => o.decision_id === d.id)
      .map((o: any) => ({
        ...o,
        decisionId: o.decision_id,
        isChosen: o.is_chosen,
        sortOrder: o.sort_order,
      })),
  }));
}

export async function getDecisionById(id: string) {
  if (!sql) return null;
  const [decision] = await sql`SELECT * FROM decisions WHERE id = ${id}`;
  if (!decision) return null;
  const options = await sql`SELECT * FROM decision_options WHERE decision_id = ${id}`;
  return {
    ...decision,
    projectId: decision.project_id,
    leadTimeDays: decision.lead_time_days,
    orderByDate: decision.order_by_date,
    decidedDate: decision.decided_date,
    linkedTaskId: decision.linked_task_id,
    createdAt: decision.created_at,
    options: options.map((o: any) => ({
      ...o,
      decisionId: o.decision_id,
      isChosen: o.is_chosen,
      sortOrder: o.sort_order,
    })),
  };
}

export async function getPlanningData() {
  if (!sql) return { conditions: [], cilSteps: [] };
  const conditions = await sql`SELECT id, project_id, condition_number, description, condition_type, status, submission_date::text, decision_date::text, notes, created_at FROM planning_conditions WHERE project_id = ${PROJECT_ID} ORDER BY condition_number`;
  const steps = await sql`SELECT id, project_id, step_number, form_name, description, status, submitted_date::text, confirmed_date::text, deadline::text, is_blocking, notes, created_at FROM cil_steps WHERE project_id = ${PROJECT_ID} ORDER BY step_number`;
  return {
    conditions: conditions.map((c: any) => ({
      ...c,
      projectId: c.project_id,
      conditionNumber: c.condition_number,
      conditionType: c.condition_type,
      submissionDate: c.submission_date,
      decisionDate: c.decision_date,
      createdAt: c.created_at,
    })),
    cilSteps: steps.map((s: any) => ({
      ...s,
      projectId: s.project_id,
      stepNumber: s.step_number,
      formName: s.form_name,
      submittedDate: s.submitted_date,
      confirmedDate: s.confirmed_date,
      isBlocking: s.is_blocking,
      createdAt: s.created_at,
    })),
  };
}

export async function getInspections() {
  if (!sql) return [];
  const rows = await sql`SELECT id, project_id, name, type, linked_task_id, status, scheduled_date::text, result_notes, inspector, is_custom, sort_order, created_at FROM inspections WHERE project_id = ${PROJECT_ID} ORDER BY sort_order`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    linkedTaskId: r.linked_task_id,
    scheduledDate: r.scheduled_date,
    resultNotes: r.result_notes,
    isCustom: r.is_custom,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }));
}

export async function getVATData() {
  if (!sql) return { entries: [], totalReclaimable: 0, counts: { total: 0, reclaimable: 0, needsReview: 0, nonReclaimable: 0 } };
  const entries = await sql`SELECT * FROM vat_entries WHERE project_id = ${PROJECT_ID}`;
  const reclaimable = entries.filter((e: any) => e.reclaimable === 'yes');
  const needsReview = entries.filter((e: any) => e.reclaimable === 'needs_review');
  const nonReclaimable = entries.filter((e: any) => e.reclaimable === 'no');
  return {
    entries: entries.map((e: any) => ({
      ...e,
      projectId: e.project_id,
      budgetEntryId: e.budget_entry_id,
      invoiceNumber: e.invoice_number,
      supplierName: e.supplier_name,
      supplierVatNumber: e.supplier_vat_number,
      netAmount: e.net_amount,
      vatAmount: e.vat_amount,
      invoiceTotal: e.invoice_total,
      invoiceDate: e.invoice_date,
      hasClaimantNameAddress: e.has_claimant_name_address,
      receiptPath: e.receipt_path,
      createdAt: e.created_at,
    })),
    totalReclaimable: reclaimable.reduce((sum: number, e: any) => sum + (e.vat_amount || 0), 0),
    counts: { total: entries.length, reclaimable: reclaimable.length, needsReview: needsReview.length, nonReclaimable: nonReclaimable.length },
  };
}

export async function getDiaryEntries() {
  if (!sql) return [];
  const rows = await sql`SELECT * FROM diary_entries WHERE project_id = ${PROJECT_ID} ORDER BY entry_date DESC`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    entryDate: r.entry_date,
    weatherTemp: r.weather_temp,
    weatherConditions: r.weather_conditions,
    weatherWind: r.weather_wind,
    workersOnSite: r.workers_on_site,
    workCompleted: r.work_completed,
    healthSafety: r.health_safety,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getPhotos() {
  if (!sql) return [];
  const rows = await sql`SELECT * FROM photos WHERE project_id = ${PROJECT_ID} ORDER BY created_at DESC`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    diaryEntryId: r.diary_entry_id,
    filePath: r.file_path,
    thumbnailPath: r.thumbnail_path,
    takenAt: r.taken_at,
    photoType: r.photo_type,
    uploadedBy: r.uploaded_by,
    createdAt: r.created_at,
  }));
}

export async function getSnags() {
  if (!sql) return [];
  const rows = await sql`SELECT * FROM snags WHERE project_id = ${PROJECT_ID} ORDER BY created_at DESC`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    photoIds: r.photo_ids,
    responsibleContact: r.responsible_contact,
    dateFound: r.date_found,
    resolutionPhotoIds: r.resolution_photo_ids,
    resolutionDate: r.resolution_date,
    resolutionNotes: r.resolution_notes,
    verifiedBy: r.verified_by,
    shareToken: r.share_token,
    createdAt: r.created_at,
  }));
}

export async function getDocuments() {
  if (!sql) return [];
  const rows = await sql`SELECT * FROM documents WHERE project_id = ${PROJECT_ID} ORDER BY uploaded_at DESC`;
  return rows.map((r: any) => ({
    ...r,
    projectId: r.project_id,
    filePath: r.file_path,
    fileSize: r.file_size,
    mimeType: r.mime_type,
    uploadedBy: r.uploaded_by,
    uploadedAt: r.uploaded_at,
  }));
}

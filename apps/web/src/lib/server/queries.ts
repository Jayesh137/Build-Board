import { db } from './db';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { projects, phases, tasks, budgetCategories, budgetEntries, contacts, decisions, decisionOptions, planningConditions, cilSteps, inspections, vatEntries, diaryEntries, photos, snags, documents, activityLog } from '@buildtracker/db';

const PROJECT_ID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';

export async function getProject() {
  if (!db) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, PROJECT_ID));
  return project || null;
}

export async function getPhases() {
  if (!db) return [];
  const allPhases = await db.select().from(phases).where(eq(phases.projectId, PROJECT_ID)).orderBy(asc(phases.sortOrder));
  const allTasks = await db.select().from(tasks).orderBy(asc(tasks.sortOrder));
  return allPhases.map(phase => ({
    ...phase,
    tasks: allTasks.filter(t => t.phaseId === phase.id),
  }));
}

export async function getBudgetCategories() {
  if (!db) return [];
  return db.select().from(budgetCategories).where(eq(budgetCategories.projectId, PROJECT_ID)).orderBy(asc(budgetCategories.sortOrder));
}

export async function getContacts() {
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.projectId, PROJECT_ID)).orderBy(desc(contacts.isPinned), asc(contacts.name));
}

export async function getDecisions() {
  if (!db) return [];
  const allDecisions = await db.select().from(decisions).where(eq(decisions.projectId, PROJECT_ID)).orderBy(asc(decisions.deadline));
  const allOptions = await db.select().from(decisionOptions);
  return allDecisions.map(d => ({
    ...d,
    options: allOptions.filter(o => o.decisionId === d.id),
  }));
}

export async function getDecisionById(id: string) {
  if (!db) return null;
  const [decision] = await db.select().from(decisions).where(eq(decisions.id, id));
  if (!decision) return null;
  const options = await db.select().from(decisionOptions).where(eq(decisionOptions.decisionId, id));
  return { ...decision, options };
}

export async function getPlanningData() {
  if (!db) return { conditions: [], cilSteps: [] };
  const conds = await db.select().from(planningConditions).where(eq(planningConditions.projectId, PROJECT_ID)).orderBy(asc(planningConditions.conditionNumber));
  const steps = await db.select().from(cilSteps).where(eq(cilSteps.projectId, PROJECT_ID)).orderBy(asc(cilSteps.stepNumber));
  return { conditions: conds, cilSteps: steps };
}

export async function getInspections() {
  if (!db) return [];
  return db.select().from(inspections).where(eq(inspections.projectId, PROJECT_ID)).orderBy(asc(inspections.sortOrder));
}

export async function getVATData() {
  if (!db) return { entries: [], totalReclaimable: 0, counts: { total: 0, reclaimable: 0, needsReview: 0, nonReclaimable: 0 } };
  const entries = await db.select().from(vatEntries).where(eq(vatEntries.projectId, PROJECT_ID));
  const reclaimable = entries.filter(e => e.reclaimable === 'yes');
  const needsReview = entries.filter(e => e.reclaimable === 'needs_review');
  const nonReclaimable = entries.filter(e => e.reclaimable === 'no');
  return {
    entries,
    totalReclaimable: reclaimable.reduce((sum, e) => sum + e.vatAmount, 0),
    counts: { total: entries.length, reclaimable: reclaimable.length, needsReview: needsReview.length, nonReclaimable: nonReclaimable.length },
  };
}

export async function getDiaryEntries() {
  if (!db) return [];
  return db.select().from(diaryEntries).where(eq(diaryEntries.projectId, PROJECT_ID)).orderBy(desc(diaryEntries.entryDate));
}

export async function getPhotos() {
  if (!db) return [];
  return db.select().from(photos).where(eq(photos.projectId, PROJECT_ID)).orderBy(desc(photos.createdAt));
}

export async function getSnags() {
  if (!db) return [];
  return db.select().from(snags).where(eq(snags.projectId, PROJECT_ID)).orderBy(desc(snags.createdAt));
}

export async function getDocuments() {
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.projectId, PROJECT_ID)).orderBy(desc(documents.uploadedAt));
}

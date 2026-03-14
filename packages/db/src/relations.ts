import { relations } from 'drizzle-orm';
import {
  projects,
  projectMembers,
  phases,
  tasks,
  taskDependencies,
  budgetCategories,
  budgetEntries,
  vatEntries,
  planningConditions,
  cilSteps,
  documents,
  contacts,
  decisions,
  decisionOptions,
  inspections,
  diaryEntries,
  photos,
  snags,
  activityLog,
} from './schema';

// ─── Project Relations ──────────────────────────────────────────────────────

export const projectsRelations = relations(projects, ({ many }) => ({
  projectMembers: many(projectMembers),
  phases: many(phases),
  budgetCategories: many(budgetCategories),
  vatEntries: many(vatEntries),
  planningConditions: many(planningConditions),
  cilSteps: many(cilSteps),
  documents: many(documents),
  contacts: many(contacts),
  decisions: many(decisions),
  inspections: many(inspections),
  diaryEntries: many(diaryEntries),
  photos: many(photos),
  snags: many(snags),
  activityLog: many(activityLog),
}));

// ─── Project Members Relations ──────────────────────────────────────────────

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
}));

// ─── Phase Relations ────────────────────────────────────────────────────────

export const phasesRelations = relations(phases, ({ one, many }) => ({
  project: one(projects, {
    fields: [phases.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

// ─── Task Relations ─────────────────────────────────────────────────────────

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  phase: one(phases, {
    fields: [tasks.phaseId],
    references: [phases.id],
  }),
  dependsOn: many(taskDependencies, { relationName: 'taskDependencies' }),
  dependedOnBy: many(taskDependencies, { relationName: 'dependsOnTask' }),
}));

// ─── Task Dependencies Relations ────────────────────────────────────────────

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: 'taskDependencies',
  }),
  dependsOn: one(tasks, {
    fields: [taskDependencies.dependsOnId],
    references: [tasks.id],
    relationName: 'dependsOnTask',
  }),
}));

// ─── Budget Categories Relations ────────────────────────────────────────────

export const budgetCategoriesRelations = relations(budgetCategories, ({ one, many }) => ({
  project: one(projects, {
    fields: [budgetCategories.projectId],
    references: [projects.id],
  }),
  budgetEntries: many(budgetEntries),
}));

// ─── Budget Entries Relations ───────────────────────────────────────────────

export const budgetEntriesRelations = relations(budgetEntries, ({ one }) => ({
  category: one(budgetCategories, {
    fields: [budgetEntries.categoryId],
    references: [budgetCategories.id],
  }),
}));

// ─── VAT Entries Relations ──────────────────────────────────────────────────

export const vatEntriesRelations = relations(vatEntries, ({ one }) => ({
  project: one(projects, {
    fields: [vatEntries.projectId],
    references: [projects.id],
  }),
}));

// ─── Planning Conditions Relations ──────────────────────────────────────────

export const planningConditionsRelations = relations(planningConditions, ({ one }) => ({
  project: one(projects, {
    fields: [planningConditions.projectId],
    references: [projects.id],
  }),
}));

// ─── CIL Steps Relations ───────────────────────────────────────────────────

export const cilStepsRelations = relations(cilSteps, ({ one }) => ({
  project: one(projects, {
    fields: [cilSteps.projectId],
    references: [projects.id],
  }),
}));

// ─── Documents Relations ────────────────────────────────────────────────────

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
}));

// ─── Contacts Relations ─────────────────────────────────────────────────────

export const contactsRelations = relations(contacts, ({ one }) => ({
  project: one(projects, {
    fields: [contacts.projectId],
    references: [projects.id],
  }),
}));

// ─── Decisions Relations ────────────────────────────────────────────────────

export const decisionsRelations = relations(decisions, ({ one, many }) => ({
  project: one(projects, {
    fields: [decisions.projectId],
    references: [projects.id],
  }),
  options: many(decisionOptions),
}));

// ─── Decision Options Relations ─────────────────────────────────────────────

export const decisionOptionsRelations = relations(decisionOptions, ({ one }) => ({
  decision: one(decisions, {
    fields: [decisionOptions.decisionId],
    references: [decisions.id],
  }),
}));

// ─── Inspections Relations ──────────────────────────────────────────────────

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  project: one(projects, {
    fields: [inspections.projectId],
    references: [projects.id],
  }),
}));

// ─── Diary Entries Relations ────────────────────────────────────────────────

export const diaryEntriesRelations = relations(diaryEntries, ({ one, many }) => ({
  project: one(projects, {
    fields: [diaryEntries.projectId],
    references: [projects.id],
  }),
  photos: many(photos),
}));

// ─── Photos Relations ───────────────────────────────────────────────────────

export const photosRelations = relations(photos, ({ one }) => ({
  project: one(projects, {
    fields: [photos.projectId],
    references: [projects.id],
  }),
  diaryEntry: one(diaryEntries, {
    fields: [photos.diaryEntryId],
    references: [diaryEntries.id],
  }),
}));

// ─── Snags Relations ────────────────────────────────────────────────────────

export const snagsRelations = relations(snags, ({ one }) => ({
  project: one(projects, {
    fields: [snags.projectId],
    references: [projects.id],
  }),
}));

// ─── Activity Log Relations ─────────────────────────────────────────────────

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, {
    fields: [activityLog.projectId],
    references: [projects.id],
  }),
}));

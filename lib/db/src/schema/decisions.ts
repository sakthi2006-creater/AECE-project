import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const decisionsTable = sqliteTable("decisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scenario: text("scenario").notNull(),
  ethicalScore: real("ethical_score").notNull(),
  decision: text("decision").notNull(),
  explanation: text("explanation").notNull(),
  alternatives: text("alternatives").notNull(),
  frameworkScores: text("framework_scores").notNull(),
  isOverridden: integer("is_overridden", { mode: 'boolean' }).notNull().default(false),
  overrideDecision: text("override_decision"),
  overrideReason: text("override_reason"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(new Date()),
});

export const insertDecisionSchema = createInsertSchema(decisionsTable).omit({ id: true, timestamp: true });
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Decision = typeof decisionsTable.$inferSelect;

export const feedbackTable = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  decisionId: integer("decision_id").notNull().references(() => decisionsTable.id),
  userFeedback: text("user_feedback").notNull(),
  comment: text("comment"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(new Date()),
});

export const insertFeedbackSchema = createInsertSchema(feedbackTable).omit({ id: true, timestamp: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbackTable.$inferSelect;

import { sqliteTable, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const weightsTable = sqliteTable("ethical_weights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  utilitarian: real("utilitarian").notNull().default(0.25),
  deontological: real("deontological").notNull().default(0.25),
  virtue: real("virtue").notNull().default(0.2),
  care: real("care").notNull().default(0.15),
  context: real("context").notNull().default(0.15),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(new Date()),
});

export const insertWeightsSchema = createInsertSchema(weightsTable).omit({ id: true, updatedAt: true });
export type InsertWeights = z.infer<typeof insertWeightsSchema>;
export type Weights = typeof weightsTable.$inferSelect;

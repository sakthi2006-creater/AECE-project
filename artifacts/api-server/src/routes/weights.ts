import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { weightsTable } from "@workspace/db/schema";
import type { EthicalWeights } from "../lib/ethical-engine.js";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

export async function getWeightsFromDb(): Promise<EthicalWeights> {
  const rows = await db.select().from(weightsTable).orderBy(desc(weightsTable.id)).limit(1);
  if (rows.length === 0) {
    return { utilitarian: 0.25, deontological: 0.25, virtue: 0.2, care: 0.15, context: 0.15 };
  }
  const row = rows[0];
  return {
    utilitarian: row.utilitarian,
    deontological: row.deontological,
    virtue: row.virtue,
    care: row.care,
    context: row.context,
  };
}

router.get("/weights", async (_req, res) => {
  const weights = await getWeightsFromDb();
  res.json(weights);
});

router.put("/weights", async (req, res) => {
  const { utilitarian, deontological, virtue, care, context } = req.body;

  const vals = [utilitarian, deontological, virtue, care, context];
  if (vals.some((v) => typeof v !== "number" || v < 0 || v > 1)) {
    res.status(400).json({ error: "All weights must be numbers between 0 and 1" });
    return;
  }

  const [saved] = await db.insert(weightsTable).values({
    utilitarian,
    deontological,
    virtue,
    care,
    context,
  }).returning();

  res.json({
    utilitarian: saved.utilitarian,
    deontological: saved.deontological,
    virtue: saved.virtue,
    care: saved.care,
    context: saved.context,
  });
});

export default router;

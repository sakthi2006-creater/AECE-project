import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { decisionsTable, feedbackTable } from "@workspace/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/history", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string || "50"), 200);
  const offset = parseInt(req.query.offset as string || "0");
  const decisionFilter = req.query.decision as string | undefined;

  let query = db.select().from(decisionsTable);
  if (decisionFilter && ["APPROVED", "CONDITIONAL", "FLAGGED", "BLOCKED"].includes(decisionFilter)) {
    query = query.where(eq(decisionsTable.decision, decisionFilter)) as typeof query;
  }

  const [decisions, totalRows] = await Promise.all([
    query.orderBy(desc(decisionsTable.timestamp)).limit(limit).offset(offset),
    db.select({ count: count() }).from(decisionsTable).then((r) => r[0]?.count ?? 0),
  ]);

  const mapped = decisions.map((d) => ({
    id: d.id,
    scenario: d.scenario,
    ethicalScore: d.ethicalScore,
    decision: d.decision,
    explanation: d.explanation,
    alternatives: JSON.parse(d.alternatives),
    frameworkScores: JSON.parse(d.frameworkScores),
    timestamp: d.timestamp.toISOString(),
    isOverridden: d.isOverridden,
    overrideDecision: d.overrideDecision ?? null,
  }));

  res.json({
    decisions: mapped,
    total: Number(totalRows),
    offset,
    limit,
  });
});

router.post("/feedback", async (req, res) => {
  const { decisionId, userFeedback, comment } = req.body;

  if (!decisionId || !userFeedback) {
    res.status(400).json({ error: "decisionId and userFeedback are required" });
    return;
  }

  if (!["approve", "reject"].includes(userFeedback)) {
    res.status(400).json({ error: "userFeedback must be 'approve' or 'reject'" });
    return;
  }

  const [saved] = await db.insert(feedbackTable).values({
    decisionId,
    userFeedback,
    comment: comment || null,
  }).returning();

  res.json({
    id: saved.id,
    decisionId: saved.decisionId,
    userFeedback: saved.userFeedback,
    timestamp: saved.timestamp.toISOString(),
  });
});

export default router;

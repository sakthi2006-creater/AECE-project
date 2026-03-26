import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { decisionsTable } from "@workspace/db/schema";
import { eq, count, avg, sql } from "drizzle-orm";
import { broadcast } from "../lib/websocket.js";
import { getUptime } from "../lib/websocket.js";

const router: IRouter = Router();

router.get("/system-status", async (_req, res) => {
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  const llmAvailable = !!(baseUrl && apiKey);

  const stats = await db
    .select({
      total: count(),
      approved: sql<number>`sum(case when decision = 'APPROVED' then 1 else 0 end)`,
      conditional: sql<number>`sum(case when decision = 'CONDITIONAL' then 1 else 0 end)`,
      flagged: sql<number>`sum(case when decision = 'FLAGGED' then 1 else 0 end)`,
      blocked: sql<number>`sum(case when decision = 'BLOCKED' then 1 else 0 end)`,
      avgScore: avg(decisionsTable.ethicalScore),
    })
    .from(decisionsTable);

  const row = stats[0];

  res.json({
    status: "online",
    totalDecisions: Number(row.total),
    approvedCount: Number(row.approved),
    conditionalCount: Number(row.conditional),
    flaggedCount: Number(row.flagged),
    blockedCount: Number(row.blocked),
    averageScore: Number(row.avgScore) || 0,
    llmAvailable,
    uptime: getUptime(),
  });
});

router.post("/override", async (req, res) => {
  const { decisionId, overrideDecision, reason } = req.body;

  if (!decisionId || !overrideDecision || !reason) {
    res.status(400).json({ error: "decisionId, overrideDecision, and reason are required" });
    return;
  }

  const valid = ["APPROVED", "CONDITIONAL", "FLAGGED", "BLOCKED"];
  if (!valid.includes(overrideDecision)) {
    res.status(400).json({ error: "Invalid overrideDecision value" });
    return;
  }

  const [updated] = await db
    .update(decisionsTable)
    .set({
      isOverridden: true,
      overrideDecision,
      overrideReason: reason,
    })
    .where(eq(decisionsTable.id, decisionId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Decision not found" });
    return;
  }

  const response = {
    id: updated.id,
    scenario: updated.scenario,
    ethicalScore: updated.ethicalScore,
    decision: updated.decision,
    explanation: updated.explanation,
    alternatives: JSON.parse(updated.alternatives),
    frameworkScores: JSON.parse(updated.frameworkScores),
    timestamp: updated.timestamp.toISOString(),
    isOverridden: updated.isOverridden,
    overrideDecision: updated.overrideDecision ?? null,
  };

  broadcast("decision_override", response);
  res.json(response);
});

export default router;

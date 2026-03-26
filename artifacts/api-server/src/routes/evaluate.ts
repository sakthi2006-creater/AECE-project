import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { decisionsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  evaluateWithOpenAI,
  computeFallbackScores,
  computeEthicalScore,
  scoreToDecision,
  generateFallbackExplanation,
  generateFallbackAlternatives,
} from "../lib/ethical-engine.js";
import { broadcast } from "../lib/websocket.js";
import { getWeightsFromDb } from "./weights.js";

const router: IRouter = Router();

router.post("/evaluate-action", async (req, res) => {
  const { scenario, context } = req.body;

  if (!scenario || typeof scenario !== "string" || scenario.trim().length === 0) {
    res.status(400).json({ error: "scenario is required" });
    return;
  }

  const fullScenario = context ? `${scenario}\n\nContext: ${context}` : scenario;
  const weights = await getWeightsFromDb();

  let result = await evaluateWithOpenAI(fullScenario, weights);
  const llmUsed = result !== null;

  if (!result) {
    const frameworkScores = computeFallbackScores(fullScenario);
    const ethicalScore = computeEthicalScore(frameworkScores, weights);
    const decision = scoreToDecision(ethicalScore);
    result = {
      ethicalScore,
      decision,
      explanation: generateFallbackExplanation(fullScenario, frameworkScores, decision),
      alternatives: generateFallbackAlternatives(fullScenario, decision),
      frameworkScores,
    };
  }

  const [saved] = await db.insert(decisionsTable).values({
    scenario: scenario.trim(),
    ethicalScore: result.ethicalScore,
    decision: result.decision,
    explanation: result.explanation,
    alternatives: JSON.stringify(result.alternatives),
    frameworkScores: JSON.stringify(result.frameworkScores),
    isOverridden: false,
  }).returning();

  const response = {
    id: saved.id,
    scenario: saved.scenario,
    ethicalScore: saved.ethicalScore,
    decision: saved.decision as "APPROVED" | "CONDITIONAL" | "FLAGGED" | "BLOCKED",
    explanation: saved.explanation,
    alternatives: JSON.parse(saved.alternatives),
    frameworkScores: JSON.parse(saved.frameworkScores),
    timestamp: saved.timestamp.toISOString(),
    isOverridden: saved.isOverridden,
    overrideDecision: saved.overrideDecision ?? null,
  };

  broadcast("new_decision", response);
  res.json(response);
});

export default router;

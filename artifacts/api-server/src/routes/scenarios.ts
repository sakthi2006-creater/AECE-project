import { Router, type IRouter } from "express";
import { getRandomScenario } from "../lib/ethical-engine.js";

const router: IRouter = Router();

router.post("/generate-scenario", (req, res) => {
  const { category } = req.body || {};
  const result = getRandomScenario(category);
  res.json(result);
});

export default router;

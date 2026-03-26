import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import evaluateRouter from "./evaluate.js";
import scenariosRouter from "./scenarios.js";
import historyRouter from "./history.js";
import weightsRouter from "./weights.js";
import governanceRouter from "./governance.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(evaluateRouter);
router.use(scenariosRouter);
router.use(historyRouter);
router.use(weightsRouter);
router.use(governanceRouter);

export default router;

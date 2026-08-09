import { Router, type IRouter } from "express";
import healthRouter from "./health";
import researchRouter from "./research";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
// Everything below requires a valid JWT: research + workspace endpoints.
// (authRouter is mounted separately at /api/auth in app.ts)
router.use(requireAuth);
router.use(researchRouter);

export default router;

import { Router } from "express";
import { getAnalytics, getUserStats } from "../controllers/analyticsController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", getAnalytics);
router.get("/user/:userId", getUserStats);

export { router as analyticsRoutes };

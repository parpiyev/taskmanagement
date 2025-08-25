import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { loginLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, getMe);

export { router as authRoutes };

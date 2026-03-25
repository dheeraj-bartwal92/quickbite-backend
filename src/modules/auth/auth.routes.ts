import { Router } from "express";
import { authRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { loginSchema, registerSchema } from "../../validators/auth.validators";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login,
);

// ── Token management ───────────────────────────────────────────────────────
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

export default router;

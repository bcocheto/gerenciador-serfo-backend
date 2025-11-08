import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticateToken } from "../middleware/auth.js";
import { authController } from "../controllers/authController.js";

const router = Router();

// Rotas públicas (não requerem autenticação)
router.post("/login", asyncHandler(authController.login));

// Rotas protegidas (requerem autenticação)
router.post("/logout", authenticateToken, asyncHandler(authController.logout));
router.get("/me", authenticateToken, asyncHandler(authController.me));
router.post(
  "/refresh",
  authenticateToken,
  asyncHandler(authController.refresh)
);
router.post(
  "/change-password",
  authenticateToken,
  asyncHandler(authController.changePassword)
);

export default router;

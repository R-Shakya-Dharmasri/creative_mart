
import { Router } from "express";
import { adminLogin } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", adminLogin);

router.get("/verify", requireAdmin, (_req, res) => {
  res.json({
    authenticated: true,
    role: "admin",
  });
});

export default router;

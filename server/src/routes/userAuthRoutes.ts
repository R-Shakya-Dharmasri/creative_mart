
import { Router } from "express";

import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userAuthController.js";

import { requireUser } from "../middleware/userAuthMiddleware.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", requireUser, getUserProfile);

export default router;

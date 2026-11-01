
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/User.js";

export interface AuthenticatedUserRequest extends Request {
  userId?: string;
}

export async function requireUser(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;

  // 1. Check Authorization header
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Server configuration error",
    });
    return;
  }

  try {
    // 2. Verify JWT token
    const decoded = jwt.verify(token, secret);

    // 3. Check User role and ID
    if (
      typeof decoded === "string" ||
      (decoded as JwtPayload).role !== "user" ||
      typeof (decoded as JwtPayload).userId !== "string"
    ) {
      res.status(403).json({
        message: "Access denied",
      });
      return;
    }

    const userId = (decoded as JwtPayload).userId;

    // 4. Check account still exists and is active
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        message: "User account is unavailable",
      });
      return;
    }

    // 5. Attach user ID to request
    req.userId = user.id;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid or expired token",
      });
      return;
    }

    console.error("User authentication failed:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}


// ==========================================
// GET LOGGED-IN USER PROFILE
// GET /api/users/me
// ==========================================

export async function getUserProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // User ID attached by requireUser middleware
    const userId = (req as Request & {
      userId?: string;
    }).userId;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Find user without exposing password hash
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user profile failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

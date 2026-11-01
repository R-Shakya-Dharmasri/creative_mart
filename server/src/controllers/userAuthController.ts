
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// USER REGISTRATION
// POST /api/users/register
// ==========================================

export async function registerUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, email, password } = req.body ?? {};

    // 1. Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        message: "Name, email and password are required",
      });
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Validate name
    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({
        message: "Name must contain 2 to 100 characters",
      });
      return;
    }

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      cleanEmail.length > 254 ||
      !emailRegex.test(cleanEmail)
    ) {
      res.status(400).json({
        message: "Please enter a valid email address",
      });
      return;
    }

    // 4. Validate password
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({
        message:
          "Password must be at least 8 characters and no more than 72 UTF-8 bytes",
      });
      return;
    }

    // 5. Check duplicate email
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    // 6. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 7. Save user in MongoDB
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      authProvider: "local",
      role: "user",
      isActive: true,
    });

    // 8. Return safe response
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    // Handle duplicate email errors
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("User registration failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

// ==========================================
// USER LOGIN
// POST /api/users/login
// ==========================================

export async function loginUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body ?? {};

    // 1. Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Find user and include password hash
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+passwordHash");

    if (
      !user ||
      user.authProvider !== "local" ||
      !user.passwordHash
    ) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // 3. Verify password
    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // 4. Check account status
    if (!user.isActive) {
      res.status(403).json({
        message: "Account is disabled",
      });
      return;
    }

    // 5. Check JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    // 6. Generate user JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: "user",
      },
      secret,
      {
        expiresIn: "2h",
      }
    );

    // 7. Return login response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User login failed:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getUserProfile(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (
      req as Request & { userId?: string }
    ).userId;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

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


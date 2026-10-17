
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { adminId: admin.id, role: "admin" },
      secret,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

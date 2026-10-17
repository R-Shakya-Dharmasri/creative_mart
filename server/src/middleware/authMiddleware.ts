
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      (decoded as JwtPayload).role !== "admin" ||
      typeof (decoded as JwtPayload).adminId !== "string"
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

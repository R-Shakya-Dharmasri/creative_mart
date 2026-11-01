
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";


import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";

const app = express();

const uploadsPath = path.resolve(
  process.cwd(),
  "uploads"
);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Allow React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));

// API rate limiting
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// Public thumbnail images
app.use(
  "/uploads/thumbnails",
  express.static(
    path.join(uploadsPath, "thumbnails")
  )
);

// Public preview images
app.use(
  "/uploads/previews",
  express.static(
    path.join(uploadsPath, "previews")
  )
);

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to SriVora API",
    status: "running",
    version: "1.0.0",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SriVora API is running!",
  });
});

// Admin authentication routes
app.use("/api/admin", authRoutes);

// Template routes
app.use("/api/templates", templateRoutes);

// 404 handler for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

export default app;

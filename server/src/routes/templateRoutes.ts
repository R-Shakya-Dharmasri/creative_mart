
import { Router } from "express";
import mongoose from "mongoose";
import Template from "../models/Template.js";

const router = Router();

// GET /api/templates - Get all templates
router.get("/", async (_req, res) => {
  try {
    const templates = await Template.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Fetch templates error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
});

// GET /api/templates/:id - Get single template
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
      return;
    }

    const template = await Template.findById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Fetch template error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
    });
  }
});

export default router;

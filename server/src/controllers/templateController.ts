
import type { Request, Response } from "express";
import type { Express } from "express";
import fs from "node:fs/promises";
import path from "node:path";

import Template from "../models/Template.js";
import { validateUploadedFiles } from "../services/fileValidationService.js";
import { InvalidZipError } from "../services/zipValidationService.js";

type UploadFields = {
  thumbnail?: Express.Multer.File[];
  previews?: Express.Multer.File[];
  templateFile?: Express.Multer.File[];
};

async function removeFiles(
  files: Express.Multer.File[]
): Promise<void> {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error("File cleanup failed:", error);
      }
    })
  );
}

function collectFiles(
  files: UploadFields
): Express.Multer.File[] {
  return Object.values(files).flat();
}

function relativeFilePath(file: Express.Multer.File): string {
  return path
    .relative(process.cwd(), file.path)
    .replaceAll("\\", "/");
}

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isUploadValidationError(error: unknown): boolean {
  if (error instanceof InvalidZipError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.startsWith("Invalid file content") ||
    error.message.startsWith("File type mismatch") ||
    error.message.startsWith("Unknown upload field")
  );
}

export const createTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = (req.files ?? {}) as UploadFields;
  const allFiles = collectFiles(files);

  try {
    // 1. Check required files

    const thumbnail = files.thumbnail?.[0];
    const original = files.templateFile?.[0];
    const previews = files.previews ?? [];

    if (!thumbnail || !original || previews.length === 0) {
      res.status(400).json({
        success: false,
        message:
          "Thumbnail, original ZIP and at least one preview are required",
      });

      await removeFiles(allFiles);
      return;
    }

    // 2. Validate actual file contents

    //await validateUploadedFiles(allFiles);

    console.log("STEP 1: Starting file validation");

    await validateUploadedFiles(allFiles);

    console.log("STEP 2: File validation completed");

    // 3. Read and validate text fields

    const title = getText(req.body.title);
    const description = getText(req.body.description);
    const category = getText(req.body.category);
    const software = getText(req.body.software) || "Other";

    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message:
          "Title, description and category are required",
      });

      await removeFiles(allFiles);
      return;
    }

    // 4. Separate image and video previews

    const previewImages: string[] = [];
    const previewVideos: string[] = [];

    for (const file of previews) {
      const filePath = relativeFilePath(file);

      if (file.mimetype.startsWith("video/")) {
        previewVideos.push(filePath);
      } else {
        previewImages.push(filePath);
      }
    }

    // 5. Process tags

    const tags = getText(req.body.tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // 6. Save template metadata to MongoDB

    console.log("STEP 3: Starting MongoDB save");

    const template = await Template.create({
      title,
      description,
      category,
      software,

      thumbnailUrl: relativeFilePath(thumbnail),
      previewImages,
      previewVideos,

      downloadUrl: relativeFilePath(original),

      fileSize: `${(
        original.size /
        (1024 * 1024)
      ).toFixed(2)} MB`,

      tags,
      isFree: true,
      downloads: 0,
    });

    console.log("STEP 4: MongoDB save completed");

    // 7. Send success response

    res.status(201).json({
      success: true,
      message: "Template uploaded successfully",
      template,
    });
  } catch (error) {
    // 8. Remove files if validation/database fails

    await removeFiles(allFiles);

    console.error("Template upload error:", error);

    const validationError = isUploadValidationError(error);

    res.status(validationError ? 400 : 500).json({
      success: false,
      message: validationError
        ? "Invalid template upload"
        : "Failed to upload template",
    });
  }
};


export const downloadTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Find template in MongoDB
    const template = await Template.findById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    // 2. Allow only free templates
    if (!template.isFree) {
      res.status(403).json({
        success: false,
        message: "This template is not available for free download",
      });
      return;
    }

    // 3. Resolve file path safely
    const originalsDirectory = path.resolve(
      process.cwd(),
      "uploads",
      "originals"
    );

    const filePath = path.resolve(
      process.cwd(),
      template.downloadUrl
    );

    // Prevent access outside originals directory
    if (
      path.dirname(filePath) !== originalsDirectory ||
      path.extname(filePath).toLowerCase() !== ".zip"
    ) {
      res.status(403).json({
        success: false,
        message: "Invalid download file",
      });
      return;
    }

    // 4. Verify file exists
    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({
        success: false,
        message: "Download file not found",
      });
      return;
    }

    // 5. Download file
    res.download(
      filePath,
      `${template._id}.zip`,
      async (error) => {
        if (error) {
          console.error("Download failed:", error);
          return;
        }

        // 6. Increase download count after successful transfer
        try {
          await Template.findByIdAndUpdate(template._id, {
            $inc: { downloads: 1 },
          });
        } catch (updateError) {
          console.error(
            "Failed to update download count:",
            updateError
          );
        }
      }
    );
  } catch (error) {
    console.error("Template download error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Failed to download template",
      });
    }
  }
};


export const updateTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id ?? "");

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
      return;
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "software",
      "tags",
    ] as const;

    const updates: Record<string, string | string[]> = {};

    // Only accept editable fields
    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        continue;
      }

      const value: unknown = req.body[field];

      if (field === "tags") {
        if (
          !Array.isArray(value) ||
          !value.every((tag) => typeof tag === "string")
        ) {
          res.status(400).json({
            success: false,
            message: "Tags must be an array of strings",
          });
          return;
        }

        updates.tags = value.map((tag) => tag.trim());
      } else {
        if (typeof value !== "string") {
          res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
          return;
        }

        const trimmed = value.trim();

        if (!trimmed) {
          res.status(400).json({
            success: false,
            message: `${field} cannot be empty`,
          });
          return;
        }

        updates[field] = trimmed;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
      return;
    }

    const template = await Template.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-downloadUrl -__v");

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error("Update template error:", error);

    if (
      error instanceof Error &&
      error.name === "ValidationError"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid template data",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update template",
    });
  }
};


export const deleteTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id ?? "");

    if (!/^[a-f\d]{24}$/i.test(id)) {
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

    // Only allow files from expected upload directories.
    const allowedDirectories = [
      path.resolve(process.cwd(), "uploads", "thumbnails"),
      path.resolve(process.cwd(), "uploads", "previews"),
      path.resolve(process.cwd(), "uploads", "originals"),
    ];

    const filePaths = [
      template.thumbnailUrl,
      ...template.previewImages,
      ...template.previewVideos,
      template.downloadUrl,
    ];

    const safePaths: string[] = [];

    for (const storedPath of filePaths) {
      if (typeof storedPath !== "string" || !storedPath) {
        continue;
      }

      const absolutePath = path.resolve(
        process.cwd(),
        storedPath
      );

      if (
        !allowedDirectories.includes(
          path.dirname(absolutePath)
        )
      ) {
        console.error(
          "Unsafe template file path:",
          storedPath
        );

        res.status(500).json({
          success: false,
          message: "Template has an invalid file path",
        });
        return;
      }

      safePaths.push(absolutePath);
    }

    // Delete database record first.
    await Template.findByIdAndDelete(id);

    // Clean up associated uploaded files.
    const results = await Promise.allSettled(
      [...new Set(safePaths)].map((filePath) =>
        fs.unlink(filePath)
      )
    );

    const failedFiles = results.filter(
      (result) =>
        result.status === "rejected" &&
        !(
          result.reason instanceof Error &&
          "code" in result.reason &&
          result.reason.code === "ENOENT"
        )
    );

    if (failedFiles.length > 0) {
      console.error(
        "Some template files could not be deleted:",
        failedFiles
      );
    }

    res.status(200).json({
      success: true,
      message:
        failedFiles.length === 0
          ? "Template deleted successfully"
          : "Template deleted, but some files require cleanup",
      cleanupComplete: failedFiles.length === 0,
    });
  } catch (error) {
    console.error("Delete template error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete template",
    });
  }
};

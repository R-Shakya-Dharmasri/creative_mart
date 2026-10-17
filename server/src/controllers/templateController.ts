
import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import Template from "../models/Template.js";
import { validateUploadedFiles } from "../services/fileValidationService.js";

type UploadFields = {
  thumbnail?: Express.Multer.File[];
  previews?: Express.Multer.File[];
  templateFile?: Express.Multer.File[];
};

async function removeFiles(files: Express.Multer.File[]) {
  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => {}))
  );
}

function collectFiles(files: UploadFields) {
  return Object.values(files).flat();
}

export const createTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = (req.files ?? {}) as UploadFields;
  const allFiles = collectFiles(files);

try {
  await validateUploadedFiles(allFiles);

  const thumbnail = files.thumbnail?.[0];
    const original = files.templateFile?.[0];
    const previews = files.previews ?? [];

    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const category =
      typeof req.body.category === "string"
        ? req.body.category.trim()
        : "";

    const software =
      typeof req.body.software === "string"
        ? req.body.software.trim()
        : "Other";

    if (!title || !description || !category) {
      await removeFiles(allFiles);

      res.status(400).json({
        message: "Title, description and category are required",
      });
      return;
}

      if (!thumbnail || !original || previews.length === 0) {
        await removeFiles(allFiles);

        res.status(400).json({
          message:
            "Thumbnail, original ZIP and at least one preview are required",
        });
        return;
      }

    const previewImages: string[] = [];
    const previewVideos: string[] = [];

    for (const file of previews) {
      const relativePath = path
        .relative(process.cwd(), file.path)
        .replaceAll("\\", "/");

      if (file.mimetype.startsWith("video/")) {
        previewVideos.push(relativePath);
      } else {
        previewImages.push(relativePath);
      }
    }

    const tags =
      typeof req.body.tags === "string"
        ? req.body.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];

    const template = await Template.create({
      title,
      description,
      category,
      software,
      thumbnailUrl: path
        .relative(process.cwd(), thumbnail.path)
        .replaceAll("\\", "/"),
      previewImages,
      previewVideos,
      downloadUrl: path
        .relative(process.cwd(), original.path)
        .replaceAll("\\", "/"),
      fileSize: `${(original.size / 1024 / 1024).toFixed(2)} MB`,
      tags,
      isFree: true,
      downloads: 0,
    });

    res.status(201).json({
      message: "Template uploaded successfully",
      template,
    });
  } catch (error) {
    await removeFiles(allFiles);

    console.error("Template upload error:", error);

    res.status(500).json({
      message: "Failed to upload template",
    });
  }
};


import { fileTypeFromFile } from "file-type";
import type { Express } from "express";

type UploadField =
  | "thumbnail"
  | "previews"
  | "templateFile";

const acceptedTypes: Record<UploadField, string[]> = {
  thumbnail: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],

  previews: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
  ],

  templateFile: [
    "application/zip",
  ],
};

export async function validateUploadedFile(
  file: Express.Multer.File
): Promise<void> {
  const field = file.fieldname as UploadField;

  const allowed = acceptedTypes[field];

  if (!allowed) {
    throw new Error("Unknown upload field");
  }

  const detected = await fileTypeFromFile(file.path);

  if (!detected || !allowed.includes(detected.mime)) {
    throw new Error(
      `Invalid file content: ${file.originalname}`
    );
  }

  // Ensure detected format matches declared MIME.
  // Some ZIP uploads legitimately use alternative MIME labels.
  if (
    field !== "templateFile" &&
    detected.mime !== file.mimetype
  ) {
    throw new Error(
      `File type mismatch: ${file.originalname}`
    );
  }
}

export async function validateUploadedFiles(
  files: Express.Multer.File[]
): Promise<void> {
  for (const file of files) {
    await validateUploadedFile(file);
  }
}

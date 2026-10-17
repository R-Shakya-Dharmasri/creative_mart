
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const uploadRoot = path.resolve(process.cwd(), "uploads");

const folders = {
  thumbnail: path.join(uploadRoot, "thumbnails"),
  previews: path.join(uploadRoot, "previews"),
  templateFile: path.join(uploadRoot, "originals"),
};

Object.values(folders).forEach((folder) => {
  fs.mkdirSync(folder, { recursive: true });
});

const allowedTypes: Record<string, string[]> = {
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
    "application/x-zip-compressed",
    "application/octet-stream",
  ],
};

const allowedExtensions: Record<string, string[]> = {
  thumbnail: [".jpg", ".jpeg", ".png", ".webp"],

  previews: [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
  ],

  templateFile: [".zip"],
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder =
      folders[file.fieldname as keyof typeof folders];

    if (!folder) {
      cb(new Error("Invalid upload field"), "");
      return;
    }

    cb(null, folder);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 7,
    fields: 10,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const types = allowedTypes[file.fieldname];
    const extensions = allowedExtensions[file.fieldname];

    if (
      !types ||
      !extensions ||
      !types.includes(file.mimetype) ||
      !extensions.includes(extension)
    ) {
      cb(new Error("Unsupported file type"));
      return;
    }

    cb(null, true);
  },
});

export const uploadTemplateFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "previews", maxCount: 5 },
  { name: "templateFile", maxCount: 1 },
]);

export { uploadRoot };

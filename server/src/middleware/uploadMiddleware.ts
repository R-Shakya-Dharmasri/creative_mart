
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import type {
  Request,
  Response,
  NextFunction,
} from "express";

// ======================================
// 1. Upload directories
// ======================================

const uploadRoot = path.resolve(process.cwd(), "uploads");

const folders = {
  thumbnail: path.join(uploadRoot, "thumbnails"),
  previews: path.join(uploadRoot, "previews"),
  templateFile: path.join(uploadRoot, "originals"),
};

Object.values(folders).forEach((folder) => {
  fs.mkdirSync(folder, { recursive: true });
});

// ======================================
// 2. Allowed MIME types
// ======================================

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

// ======================================
// 3. Allowed extensions
// ======================================

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

// ======================================
// 4. Track files written per request
// ======================================

const uploadedFiles = new WeakMap<Request, Set<string>>();

function trackFile(req: Request, filePath: string): void {
  let paths = uploadedFiles.get(req);

  if (!paths) {
    paths = new Set<string>();
    uploadedFiles.set(req, paths);
  }

  paths.add(filePath);
}

function cleanupTrackedFiles(req: Request): void {
  const paths = uploadedFiles.get(req);

  if (!paths) return;

  for (const filePath of paths) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        error.code !== "ENOENT"
      ) {
        console.error("Upload cleanup error:", error);
      }
    }
  }

  uploadedFiles.delete(req);
}

// ======================================
// 5. Multer disk storage
// ======================================

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

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `${crypto.randomUUID()}${extension}`;

    const folder =
      folders[file.fieldname as keyof typeof folders];

    if (!folder) {
      cb(new Error("Invalid upload field"), "");
      return;
    }

    trackFile(req, path.join(folder, filename));

    cb(null, filename);
  },
});

// ======================================
// 6. Multer configuration
// ======================================

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 7,
    fields: 10,
    parts: 17,
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

// ======================================
// 7. Upload fields
// ======================================

export const uploadTemplateFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "previews", maxCount: 5 },
  { name: "templateFile", maxCount: 1 },
]);

// ======================================
// 8. Error handling middleware
// ======================================

export function handleTemplateUpload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  uploadTemplateFiles(req, res, (error: unknown) => {
    if (!error) {
      uploadedFiles.delete(req);
      next();
      return;
    }

    cleanupTrackedFiles(req);

    if (error instanceof multer.MulterError) {
      const status =
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      res.status(status).json({
        message: error.message,
      });

      return;
    }

    console.error("Upload middleware error:", error);

    res.status(400).json({
      message: "Invalid file upload",
    });
  });
}

export { uploadRoot };

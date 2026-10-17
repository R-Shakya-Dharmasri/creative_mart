
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = crypto.randomUUID();

    cb(null, `${uniqueName}${extension}`);
  },
});

const allowedImages = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedArchives = [
  "application/zip",
  "application/x-zip-compressed",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 7,
  },

  fileFilter: (_req, file, cb) => {
    const isImageField =
      file.fieldname === "thumbnail" ||
      file.fieldname === "previews";

    const isArchiveField =
      file.fieldname === "templateFile";

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const validImage =
      isImageField &&
      allowedImages.includes(file.mimetype) &&
      [".jpg", ".jpeg", ".png", ".webp"].includes(
        extension
      );

    const validArchive =
      isArchiveField &&
      allowedArchives.includes(file.mimetype) &&
      extension === ".zip";

    if (validImage || validArchive) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

export const uploadTemplateFiles = upload.fields([
  {
    name: "thumbnail",
    maxCount: 1,
  },
  {
    name: "previews",
    maxCount: 5,
  },
  {
    name: "templateFile",
    maxCount: 1,
  },
]);

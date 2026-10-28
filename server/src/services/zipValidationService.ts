
import yauzl from "yauzl";

const MAX_ENTRIES = 2000;
const MAX_TOTAL_SIZE = 500 * 1024 * 1024;
const MAX_FILE_SIZE = 200 * 1024 * 1024;

export class InvalidZipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidZipError";
  }
}

export function validateZipFile(
  filePath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.open(
      filePath,
      {
        lazyEntries: true,
        autoClose: true,
        validateEntrySizes: true,
        strictFileNames: true,
      },
      (error, zipfile) => {
        if (error || !zipfile) {
          reject(new InvalidZipError("Invalid ZIP archive"));
          return;
        }

        let settled = false;
        let entryCount = 0;
        let totalSize = 0;

        const fail = (message: string) => {
          if (settled) return;
          settled = true;
          reject(new InvalidZipError(message));
          zipfile.close();
        };

        zipfile.on("error", () => {
          fail("Corrupted ZIP archive");
        });

        zipfile.on("entry", (entry) => {
          if (settled) return;

          entryCount++;

          const name = entry.fileName;

          if (
            name.startsWith("/") ||
            /^[a-zA-Z]:/.test(name) ||
            name.split("/").includes("..") ||
            name.includes("\\") ||
            name.includes("\0")
          ) {
            fail("Unsafe file path inside ZIP");
            return;
          }

          if (entryCount > MAX_ENTRIES) {
            fail("Too many files inside ZIP");
            return;
          }

          if (entry.uncompressedSize > MAX_FILE_SIZE) {
            fail("File inside ZIP is too large");
            return;
          }

          totalSize += entry.uncompressedSize;

          if (totalSize > MAX_TOTAL_SIZE) {
            fail("ZIP uncompressed size exceeds limit");
            return;
          }

          zipfile.readEntry();
        });

        zipfile.on("end", () => {
          if (settled) return;

          if (entryCount === 0) {
            fail("ZIP is empty");
            return;
          }

          settled = true;
          resolve();
        });

        // IMPORTANT:
        // Start reading the first ZIP entry.
        zipfile.readEntry();
      }
    );
  });
}

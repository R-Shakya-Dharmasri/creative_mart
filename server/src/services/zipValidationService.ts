
import yauzl from "yauzl";

const MAX_ENTRIES = 2000;
const MAX_UNCOMPRESSED_SIZE = 500 * 1024 * 1024;
const MAX_SINGLE_FILE_SIZE = 200 * 1024 * 1024;

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

        let entryCount = 0;
        let totalUncompressedSize = 0;
        let finished = false;

        const fail = (message: string) => {
          if (finished) return;
          finished = true;
          zipfile.close();
          reject(new InvalidZipError(message));
        };

        zipfile.on("error", () => {
          fail("Corrupted ZIP archive");
        });

        zipfile.on("entry", (entry) => {
          if (finished) return;

          entryCount++;

          if (entryCount > MAX_ENTRIES) {
            fail("ZIP contains too many files");
            return;
          }

          const filename = entry.fileName.replaceAll("\\", "/");

          const segments = filename.split("/");

          if (
            filename.startsWith("/") ||
            /^[a-zA-Z]:/.test(filename) ||
            segments.includes("..") ||
            filename.includes("\0")
          ) {
            fail("ZIP contains an unsafe file path");
            return;
          }

          if (entry.uncompressedSize > MAX_SINGLE_FILE_SIZE) {
            fail("ZIP contains an oversized file");
            return;
          }

          totalUncompressedSize += entry.uncompressedSize;

          if (totalUncompressedSize > MAX_UNCOMPRESSED_SIZE) {
            fail("ZIP exceeds uncompressed size limit");
            return;
          }

          zipfile.readEntry();
        });

        zipfile.on("end", () => {
          if (finished) return;

          if (entryCount === 0) {
            fail("ZIP archive is empty");
            return;
          }

          finished = true;
          resolve();
        });
      }
    );
  });
}

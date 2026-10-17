
import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Atlas connected successfully!");
  } catch (error: unknown) {
    console.error("MongoDB connection failed.");

    if (error instanceof Error) {
      const details = error as Error & {
        reason?: {
          servers?: Map<
            string,
            {
              type?: string;
              error?: Error;
            }
          >;
        };
      };

      if (details.reason?.servers) {
        for (const [host, server] of details.reason.servers) {
          console.error(`Host: ${host}`);
          console.error("Type:", server.type);
          console.error(
            "Underlying error:",
            server.error?.message ?? "Not available"
          );
        }
      } else {
        console.error(error.message);
      }
    }

    throw error;
  }
}

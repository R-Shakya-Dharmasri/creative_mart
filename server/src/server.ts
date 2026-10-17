
import "dotenv/config";
import dns from "node:dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`SriVora API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();

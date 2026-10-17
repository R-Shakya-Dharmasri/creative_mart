
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import dns from "node:dns";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters)"
    );
  }



// Inside main(), before await connectDB():
if (process.env.NODE_ENV === "development") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

  await connectDB();

  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log("Admin already exists. No changes made.");
    return;
  }

  const count = await Admin.countDocuments();

  if (count > 0) {
    throw new Error("An admin account already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await Admin.create({
    email,
    password: hashedPassword,
  });

  console.log("Admin account created successfully!");
}

main()
  .catch((error) => {
    console.error("Admin setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

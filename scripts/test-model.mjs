import mongoose from "mongoose";
import fs from "fs";
import path from "path";

function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch (err) {}
}

loadEnvFile();

// Import Admin model from the app
import { Admin } from "../lib/models/Admin.ts";

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test the same way the signin endpoint does
    const admin = await Admin.findOne({ email: "admin@example.com" }).select("+password");
    console.log("Admin found via model:", admin ? "yes" : "no");
    if (admin) {
      console.log("Email:", admin.email);
      console.log("Password field exists:", admin.password ? "yes" : "no");
      console.log("Password length:", admin.password?.length);
      console.log("Password hash:", admin.password);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

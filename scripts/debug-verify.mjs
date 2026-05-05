import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
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

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminEmail = "admin@example.com";
    const plainPassword = "Admin@123456";
    
    // Get stored admin
    const stored = await mongoose.connection.collection("admins").findOne({ email: adminEmail });
    if (!stored) {
      console.log("Admin not found");
      process.exit(1);
    }
    
    console.log("Stored password hash:", stored.password);
    console.log("Stored password type:", typeof stored.password);
    console.log("Stored password length:", stored.password?.length);
    console.log("Plain password:", plainPassword);
    
    // Test bcryptjs.compare
    const result = await bcryptjs.compare(plainPassword, stored.password);
    console.log("bcryptjs.compare result:", result);
    
    // Try with trimmed version
    if (typeof stored.password === "string") {
      const trimmed = stored.password.trim();
      console.log("Trimmed hash:", trimmed);
      const result2 = await bcryptjs.compare(plainPassword, trimmed);
      console.log("bcryptjs.compare with trimmed:", result2);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

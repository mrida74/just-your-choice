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
    
    // Drop and recreate admin
    await mongoose.connection.collection("admins").deleteMany({});
    console.log("✓ Cleared admins collection");
    
    const plainPassword = "Admin@123456";
    console.log("Hashing password with salt 10...");
    const hashedPassword = await bcryptjs.hash(plainPassword, 10);
    console.log(`✓ Hash: ${hashedPassword}`);
    
    const adminDoc = {
      email: "admin@example.com",
      phone: "+8801712345678",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
      permissions: {
        canManageProducts: true,
        canManageOrders: true,
        canManageInventory: true,
        canManageUsers: true,
        canManageSettings: true,
        canManagePromotions: true,
        canInviteUsers: true,
        canViewAnalytics: true,
        canManageReports: true,
      },
      mfa_factors: [],
      account_status: "active",
      account_activated_at: new Date(),
      last_login: new Date(),
      failed_login_attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await mongoose.connection.collection("admins").insertOne(adminDoc);
    console.log(`✓ Admin created with id: ${result.insertedId}`);
    
    // Verify by reading back
    const stored = await mongoose.connection.collection("admins").findOne({ email: "admin@example.com" });
    const verify = await bcryptjs.compare(plainPassword, stored.password);
    console.log(`✓ Password verify: ${verify}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import fs from "fs";
import path from "path";

// Try to load env from .env.local without adding dotenv dependency
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
  } catch (err) {
    // ignore errors
  }
}

loadEnvFile();

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager"], required: true },
  permissions: {
    canManageProducts: Boolean,
    canManageOrders: Boolean,
    canManageInventory: Boolean,
    canManageUsers: Boolean,
    canManageSettings: Boolean,
    canManagePromotions: Boolean,
    canInviteUsers: Boolean,
    canViewAnalytics: Boolean,
    canManageReports: Boolean,
  },
  mfa_factors: Array,
  account_status: { type: String, enum: ["pending", "active", "disabled"], default: "active" },
  account_activated_at: { type: Date, default: Date.now },
  last_login: Date,
  last_login_ip: String,
  failed_login_attempts: { type: Number, default: 0 },
  last_failed_login: Date,
}, { timestamps: true });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ MongoDB connected");

    const Admin = mongoose.model("Admin", adminSchema);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("✗ Admin already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash("Admin@123456", 10);

    const newAdmin = new Admin({
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
      account_status: "active",
      account_activated_at: new Date(),
      last_login: new Date(),
    });

    await newAdmin.save();
    console.log("✓ First admin created:");
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: Admin@123456`);
    console.log(`  ⚠ Change password after login!`);

    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

seedAdmin();

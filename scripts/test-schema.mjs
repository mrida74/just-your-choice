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

// Manually define Admin schema and test
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["admin", "manager"], required: true, index: true },
  permissions: { type: Object, default: {} },
  mfa_factors: [{ type: String }],
  account_status: { type: String, enum: ["pending", "active", "disabled"], default: "pending", index: true },
  invited_by: mongoose.Schema.Types.ObjectId,
  invited_at: Date,
  account_activated_at: Date,
  last_login: Date,
  last_login_ip: String,
  failed_login_attempts: { type: Number, default: 0 },
  last_failed_login: Date,
}, { timestamps: true, strict: false });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Admin = mongoose.model("TestAdmin", adminSchema);
    
    // Test the same query the signin endpoint uses
    const admin = await Admin.findOne({ email: "admin@example.com" }).select("+password").lean();
    console.log("Admin found:", admin ? "yes" : "no");
    if (admin) {
      console.log("Email:", admin.email);
      console.log("Password field:", admin.password ? "exists" : "missing");
      if (admin.password) {
        const ok = await bcryptjs.compare("Admin@123456", admin.password);
        console.log("Password comparison result:", ok);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

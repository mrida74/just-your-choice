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

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const colls = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", colls.map(c => c.name));
    
    // Check admins collection
    const adminCount = await mongoose.connection.collection("admins").countDocuments();
    console.log("Admins count:", adminCount);
    
    // List admins
    const admins = await mongoose.connection.collection("admins").find({}).toArray();
    console.log("Admins:", admins.map(a => ({ email: a.email, hasPassword: !!a.password })));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(".", ".env.local");
const env = fs.readFileSync(envPath, "utf-8");
const match = env.match(/^MONGODB_URI=(.*)$/m);
let MONGODB_URI = match ? match[1].trim().replace(/^["']|["']$/g, "") : undefined;
const MONGODB_DB = "just-your-choice";

await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });

const productSchema = new mongoose.Schema({}, { collection: "products", strict: false });
const Product = mongoose.model("Product", productSchema);

const count = await Product.countDocuments();
const sample = await Product.findOne();

console.log("Total products:", count);
console.log("Sample product:", sample ? `${sample.title} - $${sample.price}` : "No products found");

// List all collections
const db = mongoose.connection.db;
const collections = await db.listCollections().toArray();
console.log("\nAll collections in database:");
for (const coll of collections) {
	const docCount = await db.collection(coll.name).countDocuments();
	console.log(`  - ${coll.name}: ${docCount} documents`);
}

await mongoose.disconnect();

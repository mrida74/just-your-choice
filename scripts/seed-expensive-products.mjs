import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "just-your-choice";

const categories = ["saree", "clothing", "bags", "cosmetics", "skincare"];

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: categories, required: true },
    images: { type: [String], required: true },
    stock: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: "products" }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const catalogByCategory = {
  saree: {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    basePrice: 260,
    names: [
      "Royal Kanjivaram Zari Saree",
      "Heritage Banarasi Bridal Saree",
      "Imperial Tissue Silk Saree",
      "Pearl Weave Festival Saree",
      "Regal Handloom Paithani Saree",
      "Premium Chanderi Gold Saree",
      "Velvet Border Signature Saree",
      "Classic Wedding Pattu Saree",
      "Luxury Organza Embellished Saree",
      "Grand Zari Couture Saree",
    ],
  },
  clothing: {
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    basePrice: 190,
    names: [
      "Designer Velvet Anarkali Set",
      "Luxury Embroidered Gown Dress",
      "Premium Silk Salwar Ensemble",
      "Couture Evening Draped Dress",
      "Handcrafted Festive Kurta Set",
      "Regal Mirror Work Maxi Dress",
      "Signature Threadwork Kaftan",
      "Royal Occasion Sharara Set",
      "Deluxe Pleated Party Dress",
      "Elite Designer Coord Set",
    ],
  },
  bags: {
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
    basePrice: 210,
    names: [
      "Italian Leather Signature Tote",
      "Luxury Leather Weekend Duffle",
      "Premium Structured Office Satchel",
      "Regal Croc-Textured Handbag",
      "Gold Accent Shoulder Bag",
      "Executive Leather Work Tote",
      "Elite Mini Trunk Bag",
      "Heritage Craft Sling Bag",
      "Deluxe Quilted Chain Bag",
      "Couture Travel Carryall",
    ],
  },
  cosmetics: {
    image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=1200&q=80",
    basePrice: 180,
    names: [
      "Prestige Full-Coverage Foundation",
      "Couture Matte Lip Vault",
      "Luxe Velvet Finish Compact",
      "Pro Radiance Blush Palette",
      "High Definition Conceal Kit",
      "Elite Waterproof Eye Set",
      "Diamond Glow Primer",
      "Luxury Longwear Makeup Bundle",
      "Signature Satin Lip Collection",
      "Premium Artistry Brush Combo",
    ],
  },
  skincare: {
    image: "https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?auto=format&fit=crop&w=1200&q=80",
    basePrice: 190,
    names: [
      "Gold Peptide Renewal Serum",
      "Diamond Hydration Night Cream",
      "Platinum Repair Essence",
      "Luxury Barrier Support Moisturizer",
      "Advanced Brightening Elixir",
      "Premium Overnight Recovery Mask",
      "Regenerative Youth Ampoule",
      "Intense Firming Eye Complex",
      "Signature Dew Boost Cream",
      "Ultra Nourish Skin Ritual Set",
    ],
  },
};

const seededProducts = Object.entries(catalogByCategory).flatMap(
  ([category, config]) =>
    config.names.map((name, index) => ({
      title: name,
      description: `Premium ${category} product for luxury quality, refined styling, and long-lasting performance.`,
      price: config.basePrice + index * 15,
      category,
      images: [config.image],
      stock: Math.max(5, 18 - index),
    }))
);

async function run() {
  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
    serverSelectionTimeoutMS: 5000,
  });

  const ops = seededProducts.map((item) => ({
    updateOne: {
      filter: { title: item.title },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(ops);
  const totalCount = await Product.countDocuments();
  const expensiveCount = await Product.countDocuments({ price: { $gte: 180 } });
  const categoryCounts = await Product.aggregate([
    { $match: { category: { $in: categories } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log("SEED_OK");
  console.log("Inserted:", result.upsertedCount);
  console.log("Modified:", result.modifiedCount);
  console.log("Matched:", result.matchedCount);
  console.log("Total products:", totalCount);
  console.log("Products >= 180:", expensiveCount);
  console.log("Category counts:", JSON.stringify(categoryCounts));

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("SEED_FAILED:", error.message);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});

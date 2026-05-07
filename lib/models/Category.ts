import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";

const categorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    bannerImage: {
      type: String,
      trim: true,
    },
    heroImage: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 120,
      },
      description: {
        type: String,
        trim: true,
        maxlength: 300,
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ featured: 1, sortOrder: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

const CategoryModel =
  (models.Category as Model<CategoryDocument>) ||
  model<CategoryDocument>("Category", categorySchema);

export default CategoryModel;

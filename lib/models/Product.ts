import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: true,
      index: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (images: string[]) => images.length > 0,
        message: "At least one image is required.",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, price: 1 });
productSchema.index({ title: "text", description: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;

const ProductModel =
  (models.Product as Model<ProductDocument>) ||
  model<ProductDocument>("Product", productSchema);

export default ProductModel;

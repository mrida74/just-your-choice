import { model, models, Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimetype: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "document", "video"],
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    thumbnailUrl: String,

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    uploadedByEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    uploadedByName: {
      type: String,
      required: true,
    },

    metadata: {
      width: Number,
      height: Number,
      duration: Number, // for videos, in seconds
      pages: Number, // for PDFs
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    description: String,

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ type: 1, createdAt: -1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ filename: "text", originalName: "text", description: "text" });
mediaSchema.index({ createdAt: -1 });

export default models.Media || model("Media", mediaSchema);

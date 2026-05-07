import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import { AVAILABLE_PERMISSIONS } from "@/types/role";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    permissions: {
      type: [String],
      enum: AVAILABLE_PERMISSIONS,
      default: [],
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isDefault: 1 });

export type RoleDocument = InferSchemaType<typeof roleSchema>;

const RoleModel = (models.Role as Model<RoleDocument>) || model<RoleDocument>("Role", roleSchema);

export default RoleModel;

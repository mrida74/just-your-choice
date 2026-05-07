import { connectToDatabase } from "@/lib/mongodb";
import RoleModel from "@/lib/models/Role";
import type { RoleItem, RolePayload, Permission } from "@/types/role";

function serializeRole(doc: any): RoleItem {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? undefined,
    permissions: doc.permissions || [],
    isDefault: Boolean(doc.isDefault),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

/**
 * Get all roles.
 */
export async function getRoles() {
  await connectToDatabase();
  const docs = await RoleModel.find().sort({ name: 1 }).lean();
  return docs.map(serializeRole);
}

/**
 * Get a role by ID.
 */
export async function getRoleById(roleId: string) {
  await connectToDatabase();
  const doc = await RoleModel.findById(roleId).lean();
  return doc ? serializeRole(doc) : null;
}

/**
 * Get a role by name.
 */
export async function getRoleByName(name: string) {
  await connectToDatabase();
  const doc = await RoleModel.findOne({ name }).lean();
  return doc ? serializeRole(doc) : null;
}

/**
 * Create a role.
 */
export async function createRole(payload: RolePayload) {
  await connectToDatabase();

  const role = new RoleModel({
    name: payload.name.trim(),
    description: payload.description?.trim(),
    permissions: payload.permissions || [],
  });

  const saved = await role.save();
  return serializeRole(saved);
}

/**
 * Update a role.
 */
export async function updateRole(roleId: string, payload: Partial<RolePayload>) {
  await connectToDatabase();

  const update: any = {};
  if (payload.name !== undefined) update.name = payload.name.trim();
  if (payload.description !== undefined) update.description = payload.description?.trim();
  if (payload.permissions !== undefined) update.permissions = payload.permissions;

  const updated = await RoleModel.findByIdAndUpdate(roleId, { $set: update }, { new: true }).lean();
  return updated ? serializeRole(updated) : null;
}

/**
 * Delete a role.
 */
export async function deleteRole(roleId: string) {
  await connectToDatabase();

  const role = await RoleModel.findById(roleId).lean();
  if (!role) return false;

  // Prevent deleting default roles
  if (role.isDefault) {
    throw new Error("Cannot delete default role.");
  }

  const res = await RoleModel.deleteOne({ _id: roleId }).exec();
  return res.deletedCount === 1;
}

/**
 * Initialize default roles.
 */
export async function initializeDefaultRoles() {
  await connectToDatabase();

  const existing = await RoleModel.findOne({ isDefault: true }).lean();
  if (existing) return;

  // Define default roles with permission sets
  const defaultRoles = [
    {
      name: "Super Admin",
      description: "Full access to all features",
      permissions: [
        "view_categories", "manage_categories",
        "view_products", "create_products", "edit_products", "delete_products", "manage_inventory",
        "view_coupons", "manage_coupons",
        "view_reviews", "moderate_reviews",
        "view_orders", "manage_orders", "refund_orders",
        "view_customers", "manage_customers",
        "view_settings", "manage_settings",
        "view_admins", "manage_admins", "manage_roles",
        "view_audit_logs", "export_audit_logs",
        "upload_media", "delete_media",
        "view_shipping", "manage_shipping",
        "view_analytics", "export_reports",
      ] as Permission[],
      isDefault: true,
    },
    {
      name: "Manager",
      description: "Manage products, orders, and customers",
      permissions: [
        "view_categories",
        "view_products", "create_products", "edit_products", "manage_inventory",
        "view_coupons",
        "view_reviews", "moderate_reviews",
        "view_orders", "manage_orders",
        "view_customers",
        "view_settings",
        "upload_media",
        "view_shipping", "manage_shipping",
        "view_analytics",
      ] as Permission[],
      isDefault: true,
    },
    {
      name: "Support Agent",
      description: "Handle customer inquiries and orders",
      permissions: [
        "view_orders", "manage_orders", "refund_orders",
        "view_customers",
        "view_reviews", "moderate_reviews",
        "view_settings",
      ] as Permission[],
      isDefault: true,
    },
    {
      name: "Analyst",
      description: "View analytics and export reports",
      permissions: [
        "view_products",
        "view_orders",
        "view_customers",
        "view_settings",
        "view_analytics",
        "export_reports",
        "view_audit_logs",
        "export_audit_logs",
      ] as Permission[],
      isDefault: true,
    },
  ];

  for (const roleData of defaultRoles) {
    const role = new RoleModel(roleData);
    await role.save();
  }

  return defaultRoles.length;
}

/**
 * Get permissions for a role.
 */
export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const role = await getRoleById(roleId);
  return role?.permissions || [];
}

/**
 * Check if a role has a permission.
 */
export async function roleHasPermission(roleId: string, permission: Permission): Promise<boolean> {
  const permissions = await getRolePermissions(roleId);
  return permissions.includes(permission);
}

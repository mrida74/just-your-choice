import { User } from "./models/User";
import { Admin } from "./models/Admin";
import { Invitation } from "./models/Invitation";
import AuditLogModel from "./models/AuditLog";
import { connectToDatabase } from "./mongodb";
import bcryptjs from "bcryptjs";
import { generateInvitationToken } from "./auth-utils";

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  try {
    return await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

/**
 * Find user by Google ID
 */
export async function findUserByGoogleId(googleId: string) {
  try {
    return await User.findOne({ googleId });
  } catch (error) {
    console.error("Error finding user by Google ID:", error);
    return null;
  }
}

/**
 * Find user by Facebook ID
 */
export async function findUserByFacebookId(facebookId: string) {
  try {
    return await User.findOne({ facebookId });
  } catch (error) {
    console.error("Error finding user by Facebook ID:", error);
    return null;
  }
}

/**
 * Create a new customer user
 */
export async function createUser(userData: {
  email: string;
  phone: string;
  name: string;
  auth_method: string;
  googleId?: string;
  facebookId?: string;
}) {
  try {
    const user = new User({
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      name: userData.name,
      auth_method: userData.auth_method,
      googleId: userData.googleId,
      facebookId: userData.facebookId,
      role: "customer",
      account_created_at: new Date(),
      verified: false,
    });
    return await user.save();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: Record<string, any>
) {
  try {
    return await User.findByIdAndUpdate(userId, profileData, { new: true });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Find admin by email
 */
export async function findAdminByEmail(email: string) {
  try {
    await connectToDatabase();
    return await Admin.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error("Error finding admin:", error);
    return null;
  }
}

/**
 * Create admin account (for invitation acceptance)
 */
export async function createAdmin(adminData: {
  email: string;
  password: string;
  phone: string;
  name: string;
  role: "admin" | "manager";
  invitedBy: string;
}) {
  try {
    await connectToDatabase();
    const hashedPassword = await bcryptjs.hash(adminData.password, 12);

    const admin = new Admin({
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      phone: adminData.phone,
      name: adminData.name,
      role: adminData.role,
      invited_by: adminData.invitedBy,
      invited_at: new Date(),
      account_status: "active",
      account_activated_at: new Date(),
    });

    return await admin.save();
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(
  email: string,
  password: string
): Promise<{ valid: boolean; admin: any }> {
  try {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase();
    
    const admin = await Admin.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    
    if (!admin) {
      return { valid: false, admin: null };
    }

    const isValid = await bcryptjs.compare(password, admin.password);
    return { valid: isValid, admin: isValid ? admin : null };
  } catch (error) {
    console.error("Error verifying admin password:", error);
    return { valid: false, admin: null };
  }
}

/**
 * Send admin invitation
 */
export async function sendAdminInvitation(
  email: string,
  role: "admin" | "manager",
  invitedByAdminId: string,
  expiryHours: number = 24
) {
  try {
    await connectToDatabase();
    // Check if admin already exists
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      return { success: false, message: "Admin already exists with this email" };
    }

    // Check if pending invitation exists
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      status: "pending",
    });

    if (existingInvitation && existingInvitation.tokenExpiresAt > new Date()) {
      return {
        success: false,
        message: "Invitation already sent to this email",
      };
    }

    // Generate invitation token
    const { token, hashedToken, expiresAt } =
      generateInvitationToken(expiryHours);

    // Create invitation record
    const invitation = new Invitation({
      email: email.toLowerCase(),
      invitedBy: invitedByAdminId,
      role,
      invitationToken: hashedToken,
      tokenExpiresAt: expiresAt,
      status: "pending",
    });

    await invitation.save();

    return {
      success: true,
      token,
      expiresAt,
      message: "Invitation sent successfully",
    };
  } catch (error) {
    console.error("Error sending admin invitation:", error);
    throw error;
  }
}

/**
 * Accept admin invitation
 */
export async function acceptAdminInvitation(
  invitationToken: string,
  adminData: {
    password: string;
    name: string;
    phone: string;
  }
) {
  try {
    // Find invitation by token
    const { hashToken } = await import("./auth-utils");
    const hashedToken = hashToken(invitationToken);

    const invitation = await Invitation.findOne({
      invitationToken: hashedToken,
      status: "pending",
      tokenExpiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return { success: false, message: "Invalid or expired invitation" };
    }

    // Create admin account
    const admin = await createAdmin({
      email: invitation.email,
      password: adminData.password,
      phone: adminData.phone,
      name: adminData.name,
      role: invitation.role as "admin" | "manager",
      invitedBy: invitation.invitedBy.toString(),
    });

    // Mark invitation as accepted
    invitation.status = "accepted";
    invitation.inviteAcceptedAt = new Date();
    invitation.acceptedBy = admin._id;
    await invitation.save();

    return { success: true, admin, message: "Account created successfully" };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
}

/**
 * Log admin action
 */
export async function logAdminAction(auditData: {
  adminId: string;
  adminEmail: string;
  action: string;
  resource?: string;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failed";
  errorMessage?: string;
  changes?: { before: any; after: any };
}) {
  try {
    await connectToDatabase();
    // Don't log with invalid adminId (like "unknown")
    if (auditData.adminId === "unknown" || !auditData.adminId.match(/^[0-9a-fA-F]{24}$/)) {
      return;
    }
    // Normalize action to match enum in AuditLog schema
    const normalizeAction = (input: string) => {
      if (!input) return "view";
      const s = input.toLowerCase();
      if (s.includes("login") || s.includes("signin")) return "signin";
      if (s.includes("logout")) return "logout";
      if (s.includes("create")) return "create";
      if (s.includes("update")) return "update";
      if (s.includes("delete")) return "delete";
      if (s.includes("export")) return "export";
      if (s.includes("approve")) return "approve";
      if (s.includes("reject")) return "reject";
      if (s.includes("download")) return "download";
      return s;
    };

    const normalizedAction = normalizeAction(auditData.action);

    // Ensure required fields exist for schema
    const resourceType = (auditData.resource || "admin").toString();
    const resourceId = auditData.resourceId || auditData.adminId || "";
    const adminEmail = (auditData.adminEmail || "").toLowerCase();
    const adminName = (auditData as any).adminName || adminEmail.split("@")[0] || "";

    const payload = {
      action: normalizedAction,
      resourceType,
      resourceId,
      resourceName: auditData.description,
      adminId: auditData.adminId,
      adminEmail,
      adminName,
      changes: auditData.changes,
      metadata: {
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
      },
      status: auditData.status || "success",
      errorMessage: auditData.errorMessage,
    } as any;

    const auditLog = new AuditLogModel(payload);
    return await auditLog.save();
  } catch (error) {
    console.error("Error logging admin action:", error);
    // Don't throw - audit logging should not break main operations
  }
}

/**
 * Get admin audit logs
 */
export async function getAdminAuditLogs(
  adminId?: string,
  options?: { limit?: number; skip?: number; action?: string }
) {
  try {
    await connectToDatabase();
    const query: any = {};
    if (adminId) {
      query.adminId = adminId;
    }
    if (options?.action) {
      query.action = options.action;
    }

    return await AuditLogModel.find(query)
      .sort({ createdAt: -1 })
      .limit(options?.limit || 100)
      .skip(options?.skip || 0);
  } catch (error) {
    console.error("Error getting audit logs:", error);
    return [];
  }
}

/**
 * Disable admin account
 */
export async function disableAdminAccount(adminId: string, reason?: string) {
  try {
    await connectToDatabase();
    return await Admin.findByIdAndUpdate(
      adminId,
      {
        account_status: "disabled",
      },
      { new: true }
    );
  } catch (error) {
    console.error("Error disabling admin:", error);
    throw error;
  }
}

/**
 * Get admin by ID with permissions
 */
export async function getAdminWithPermissions(adminId: string) {
  try {
    await connectToDatabase();
    return await Admin.findById(adminId).select("-password");
  } catch (error) {
    console.error("Error getting admin:", error);
    return null;
  }
}

/**
 * Get all admins (serialized)
 */
export async function getAdmins() {
  try {
    await connectToDatabase();
    const docs = await Admin.find().sort({ email: 1 }).lean();
    return docs.map((doc: any) => ({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      phone: doc.phone,
      role: doc.role,
      roleId: doc.roleId ? doc.roleId.toString() : null,
      account_status: doc.account_status,
      last_login: doc.last_login ? doc.last_login.toISOString() : null,
      invited_by: doc.invited_by ? doc.invited_by.toString() : null,
      createdAt: doc.createdAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

/**
 * Check admin permission
 */
export function hasPermission(admin: any, permission: keyof typeof admin.permissions): boolean {
  return admin?.permissions?.[permission] === true;
}

import { NextRequest, NextResponse } from "next/server";
import { generateTOTPSecret, verifyTOTPCode } from "@/lib/auth-utils";
import { Admin } from "@/lib/models/Admin";

interface TOTPSetupRequest {
  adminId: string;
}

interface TOTPVerifyRequest {
  adminId: string;
  code: string;
  secret: string;
}

/**
 * GET - Generate TOTP secret and QR code
 */
export async function GET(request: NextRequest) {
  try {
    // This should be called after admin is authenticated
    // Extract adminId from query params or JWT token
    const adminId = request.nextUrl.searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Admin ID required" },
        { status: 400 }
      );
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Generate TOTP secret
    const { secret, qrCode, backupCodes, manualEntryKey } = await generateTOTPSecret(
      admin.email,
      "Just Your Choice Admin"
    );

    return NextResponse.json(
      {
        success: true,
        secret,
        qrCode,
        backupCodes,
        manualEntryKey,
        message: "Scan the QR code with your authenticator app",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TOTP setup error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate TOTP secret",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Verify TOTP code and enable MFA
 */
export async function POST(request: NextRequest) {
  try {
    const body: TOTPVerifyRequest = await request.json();

    // Validate input
    if (!body.adminId || !body.code || !body.secret) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await Admin.findById(body.adminId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify TOTP code
    const verified = verifyTOTPCode(body.secret, body.code);
    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Invalid TOTP code" },
        { status: 401 }
      );
    }

    // Generate backup codes
    const { generateBackupCodes, hashBackupCode } = await import("@/lib/auth-utils");
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map((code) => ({
      code: hashBackupCode(code),
      used: false,
    }));

    // Update admin with MFA enabled
    admin.mfa_factors = [
      {
        type: "totp" as const,
        enabled: true,
        secret: body.secret,
        createdAt: new Date(),
      },
    ];
    // Store backup codes separately (you might want a separate collection for this)
    // For now, we'll just return them once during setup
    
    await admin.save();

    return NextResponse.json(
      {
        success: true,
        message: "TOTP enabled successfully",
        backupCodes: backupCodes, // Return these ONCE - user should save them
        warning: "Save these backup codes in a secure place. You won't see them again.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TOTP verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enable TOTP",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

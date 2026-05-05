import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "customer" | "admin" | "manager";
      email: string;
      name?: string;
      image?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: "customer" | "admin" | "manager";
    auth_method?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "customer" | "admin" | "manager";
    auth_method?: string;
  }
}

export interface AuthError {
  code: string;
  message: string;
}

export enum AuthProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

export interface CustomerAuthData {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  image?: string;
}

export interface AdminAuthData {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerifyRequest {
  secret: string;
  code: string;
  backupCode?: string;
}

export interface MFAVerifyResponse {
  verified: boolean;
  backupCodes?: string[];
  message?: string;
}

export interface InvitationData {
  email: string;
  role: "admin" | "manager";
  expiryHours?: number;
}

export interface InvitationResponse {
  success: boolean;
  invitationToken?: string;
  message: string;
}

export interface AdminLoginResponse {
  requiresMFA: boolean;
  sessionId?: string;
  message?: string;
}

export interface AdminMFAVerifyResponse {
  success: boolean;
  token?: string;
  expiresAt?: Date;
  message?: string;
}

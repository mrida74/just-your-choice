# Just Your Choice - Auth & Order Architecture

## Overview

This document outlines the complete authentication, authorization, and order management architecture for the Just Your Choice ecommerce platform.

**Tech Stack**: Next.js 16, NextAuth/Auth.js, MongoDB, TypeScript

---

## 1. Authentication Architecture

### 1.1 Customer Authentication (Passwordless)

#### Flow Diagram
```
Customer visits site
    ↓
Choose login method:
├── Google OAuth
├── Facebook OAuth
└── Guest Checkout
    ↓
If social login:
  ├── Redirect to OAuth provider
  ├── Create/map user in DB
  └── Set session cookie
    ↓
If guest checkout:
  ├── Skip authentication
  ├── Allow checkout with email/phone
  └── Save as guest order
    ↓
On checkout with "Create Account" checked:
  ├── Check if user exists (by email)
  ├── If exists → show merge confirmation
  ├── If not → create new account
  └── Link order to user
```

#### Customer User Model
```typescript
{
  _id: ObjectId,
  email: string (unique),
  phone: string,
  name: string,
  googleId?: string,
  facebookId?: string,
  role: "customer",
  profile: {
    firstName: string,
    lastName: string,
    phone: string,
    addresses: [{
      label: string,
      street: string,
      city: string,
      state: string,
      zipCode: string,
      country: string,
      isDefault: boolean
    }]
  },
  auth_method: "google" | "facebook",
  verified: boolean (optional, for email verification),
  account_created_at: Date,
  last_login: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 1.2 Admin Authentication (MFA Required)

#### Flow Diagram
```
Admin accesses /admin/login
    ↓
Check if invited (in Invitations collection)
    ↓
If not invited → show "Contact your admin"
    ↓
If invited:
  ├── Enter email and password (if account not yet created)
  ├── Or use existing password
  └── Click "Sign In"
    ↓
Primary authentication succeeds
    ↓
Require MFA (mandatory):
├── TOTP (Authenticator app)
└── Passkey/WebAuthn
    ↓
After MFA verification
    ↓
Create short-lived admin session
    ↓
Grant access to /admin panel
```

#### Admin User Model
```typescript
{
  _id: ObjectId,
  email: string (unique),
  phone: string,
  name: string,
  password: string (hashed with bcrypt),
  role: "admin" | "manager",
  permissions: {
    canManageProducts: boolean,
    canManageOrders: boolean,
    canManageInventory: boolean,
    canManageUsers: boolean,
    canManageSettings: boolean,
    canManagePromotions: boolean,
    canInviteUsers: boolean,
    canViewAnalytics: boolean,
    canManageReports: boolean
  },
  mfa_factors: [{
    type: "totp" | "passkey",
    enabled: boolean,
    secret?: string (for TOTP),
    credentialId?: string (for Passkey),
    createdAt: Date
  }],
  account_status: "pending" | "active" | "disabled",
  invited_by: ObjectId (admin who invited),
  invited_at: Date,
  account_activated_at: Date,
  last_login: Date,
  last_login_ip?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Admin Invitation Model
```typescript
{
  _id: ObjectId,
  email: string,
  invitedBy: ObjectId (admin id),
  role: "admin" | "manager",
  invitationToken: string (unique, random),
  tokenExpiresAt: Date (24 hours from now),
  status: "pending" | "accepted" | "expired",
  inviteAcceptedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Admin Session Model (Optional - for audit logging)
```typescript
{
  _id: ObjectId,
  adminId: ObjectId,
  sessionToken: string,
  expiresAt: Date,
  createdAt: Date,
  createdIp?: string,
  lastActivityAt: Date,
  revoked: boolean
}
```

---

## 2. Order Management Architecture

### 2.1 Order Flow

#### Without Account (Guest)
```
Customer adds items to cart
    ↓
Clicks "Checkout"
    ↓
Fills: name, email, phone, address
    ↓
[✓] Create account for future orders? (optional, unchecked)
    ↓
Review & Place Order
    ↓
Order saved with guestEmail, guestPhone
    ↓
Confirmation email sent
    ↓
No user account created
```

#### With Account Creation
```
Customer adds items to cart
    ↓
Clicks "Checkout"
    ↓
Fills: name, email, phone, address
    ↓
[✓] Create account for future orders? (checked)
    ↓
Review & Place Order
    ↓
System checks: email already exists?
├── Yes → Show: "Account exists. Link this order?"
│   ├── Confirm → Merge with existing
│   └── Cancel → Save as guest
└── No → Create new account silently
    ↓
Order saved with userId
    ↓
Confirmation email sent
    ↓
User can login next time for faster checkout
```

### 2.2 Order Model

```typescript
{
  _id: ObjectId,
  orderNumber: string (unique, auto-generated like "ORD-20260505-001"),
  
  // Customer info - always captured
  customer: {
    name: string,
    email: string,
    phone: string,
    address: {
      street: string,
      city: string,
      state: string,
      zipCode: string,
      country: string
    }
  },
  
  // User reference - optional
  userId?: ObjectId (null for guest orders),
  
  // Guest identifiers (if no userId)
  guestEmail?: string,
  guestPhone?: string,
  
  // Order items
  items: [{
    productId: ObjectId,
    productName: string,
    sku: string,
    quantity: number,
    price: number,
    total: number
  }],
  
  // Pricing
  subtotal: number,
  tax: number,
  shipping: number,
  discount?: number,
  couponCode?: string,
  total: number,
  
  // Status tracking
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded",
  paymentStatus: "pending" | "completed" | "failed" | "refunded",
  paymentMethod: string,
  
  // Timeline
  createdAt: Date,
  confirmedAt?: Date,
  shippedAt?: Date,
  deliveredAt?: Date,
  cancelledAt?: Date,
  
  // Shipping
  shippingMethod: string,
  trackingNumber?: string,
  estimatedDelivery?: Date,
  
  // Admin notes
  notes?: string,
  adminNotes?: string,
  
  updatedAt: Date
}
```

---

## 3. Role-Based Permission Model

### 3.1 Admin Permissions

#### Admin Role (Full Access)
```
✓ View Dashboard & Analytics
✓ Manage Products (Create, Edit, Delete)
✓ Manage Orders (View, Update, Cancel)
✓ Manage Inventory
✓ Manage Users (View, Create, Edit)
✓ Manage Admins/Managers (Invite, Edit, Remove)
✓ View Settings
✓ Manage Promotions & Coupons
✓ View Audit Logs
✓ Access Reports
```

#### Manager Role (Limited Access)
```
✓ View Dashboard
✓ Manage Products (Create, Edit, NO Delete)
✓ Manage Orders (View, Update, NO Cancel)
✓ Manage Inventory
✗ Manage Users
✗ Manage Other Admins
✗ View Settings
✓ Manage Promotions (NO Delete)
✗ View Audit Logs (own actions only)
✓ View Reports (basic)
```

---

## 4. API Routes & Endpoints

### 4.1 Customer Auth Routes

```
POST /api/auth/signin
  Body: { provider: "google" | "facebook" }
  Response: Redirect to OAuth provider

POST /api/auth/callback/google
  Handled by NextAuth internally
  
POST /api/auth/callback/facebook
  Handled by NextAuth internally

POST /api/auth/signout
  Effect: Clear session, redirect to home

GET /api/auth/session
  Response: { user: {...}, expires: Date } or null
```

### 4.2 Checkout & Account Routes

```
POST /api/checkout/validate
  Body: { items: [], customerInfo: {...} }
  Response: { isValid: boolean, errors?: [...] }

POST /api/checkout/place-order
  Body: {
    items: [],
    customerInfo: { name, email, phone, address },
    createAccount: boolean,
    paymentInfo: {...}
  }
  Process:
    ├── If createAccount === true:
    │   ├── Check if user exists (by email)
    │   ├── If exists → ask confirmation
    │   └── If new → create account
    ├── Save order (with userId or guestEmail)
    ├── Send confirmation email
    └── Return { orderNumber, orderCreated: true }

POST /api/checkout/claim-guest-order
  Body: { guestEmail, userId }
  Effect: Link guest order to user account
  Response: { success: boolean }

GET /api/orders/guest/:guestEmail
  Query: { guestPhone }
  Response: [ orders ]

GET /api/orders/:orderNumber
  Response: { order details }
```

### 4.3 Admin Auth Routes

```
POST /api/admin/auth/signin
  Body: { email, password }
  Effect: Primary auth check
  Response: { requiresMFA: true, sessionId: string }

POST /api/admin/auth/mfa/verify
  Body: { sessionId, mfaCode }
  Effect: Verify TOTP/Passkey
  Response: { token, expiresAt }

POST /api/admin/auth/signout
  Effect: Clear admin session, revoke token

GET /api/admin/auth/session
  Response: { user: {...}, role, permissions }
```

### 4.4 Admin Invitation Routes

```
POST /api/admin/invitations/send
  Body: { email, role: "admin" | "manager" }
  Auth: Admin only
  Response: { invitationToken, expiryTime }

GET /api/admin/invitations/:token
  (Public) Check if invitation valid
  Response: { email, role, expiresAt, isValid }

POST /api/admin/invitations/accept
  Body: { invitationToken, password, name, phone }
  Effect: Create admin account, mark invitation accepted
  Response: { success, adminId }

GET /api/admin/users
  Auth: Admin only
  Response: [ { id, email, name, role, status, lastLogin } ]

PATCH /api/admin/users/:userId
  Auth: Admin only
  Body: { role?, status?, permissions? }
  Response: { updated user }
```

### 4.5 Admin Product & Order Routes

```
GET /api/admin/products
  Auth: Admin/Manager
  Query: { skip, limit, search, category }
  Response: [ products ]

POST /api/admin/products
  Auth: Admin
  Body: { name, description, price, ... }
  Response: { productId }

PATCH /api/admin/products/:id
  Auth: Admin/Manager
  Response: { updated product }

DELETE /api/admin/products/:id
  Auth: Admin only
  Response: { success }

GET /api/admin/orders
  Auth: Admin/Manager
  Query: { skip, limit, status, dateFrom, dateTo }
  Response: [ orders ]

PATCH /api/admin/orders/:orderId
  Auth: Admin/Manager
  Body: { status?, paymentStatus?, adminNotes?, trackingNumber? }
  Response: { updated order }
```

---

## 5. File Structure

```
just-your-choice/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts (NextAuth handler)
│   │   │   └── session/
│   │   │       └── route.ts
│   │   ├── checkout/
│   │   │   ├── validate/
│   │   │   │   └── route.ts
│   │   │   ├── place-order/
│   │   │   │   └── route.ts
│   │   │   └── claim-order/
│   │   │       └── route.ts
│   │   ├── orders/
│   │   │   ├── guest/
│   │   │   │   └── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── admin/
│   │       ├── auth/
│   │       │   ├── signin/
│   │       │   │   └── route.ts
│   │       │   ├── mfa/
│   │       │   │   └── verify/
│   │       │   │       └── route.ts
│   │       │   └── signout/
│   │       │       └── route.ts
│   │       ├── invitations/
│   │       │   ├── send/
│   │       │   │   └── route.ts
│   │       │   ├── accept/
│   │       │   │   └── route.ts
│   │       │   └── [token]/
│   │       │       └── route.ts
│   │       ├── users/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       ├── products/
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── route.ts
│   │       └── orders/
│   │           ├── [id]/
│   │           │   └── route.ts
│   │           └── route.ts
│   ├── admin/
│   │   ├── layout.tsx (with auth guard)
│   │   ├── page.tsx (dashboard)
│   │   ├── login/
│   │   │   └── page.tsx (admin login with MFA)
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── invitations/
│   │       └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── order-success/
│   │   └── [orderNumber]/
│   │       └── page.tsx
│   └── orders/
│       └── [orderNumber]/
│           └── page.tsx
├── lib/
│   ├── auth.ts (NextAuth configuration)
│   ├── db.ts (MongoDB connection)
│   ├── mfa.ts (TOTP/Passkey utilities)
│   ├── permissions.ts (Role-based checks)
│   ├── order-service.ts
│   ├── user-service.ts
│   ├── admin-service.ts
│   └── utils.ts
├── types/
│   ├── auth.ts
│   ├── order.ts
│   ├── user.ts
│   └── admin.ts
├── middleware.ts (Session validation, route guards)
└── ARCHITECTURE.md (this file)
```

---

## 6. NextAuth Configuration

### 6.1 auth.ts Setup

```typescript
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { mongoClient } from "./mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(mongoClient),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role || "customer";
      return session;
    },
    async signIn({ user, account }) {
      // Log sign-in, prevent admin from using Google/Facebook
      return true;
    },
  },
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};
```

---

## 7. Security Considerations

### 7.1 Authentication Security
- ✓ OAuth2 for social login (no password for customers)
- ✓ httpOnly cookies for session storage
- ✓ CSRF protection via NextAuth
- ✓ HTTPS only in production
- ✓ Rate limiting on auth endpoints
- ✓ Password hashing (bcrypt) for admin accounts
- ✓ MFA mandatory for admin (TOTP/Passkey)

### 7.2 Authorization Security
- ✓ Server-side permission checks (never trust client)
- ✓ Middleware validates admin routes
- ✓ Session token validation on each admin request
- ✓ Role-based access on API endpoints

### 7.3 Data Security
- ✓ Never store passwords in plain text
- ✓ Encrypt sensitive admin data (if needed)
- ✓ Validate & sanitize all inputs
- ✓ No sensitive data in session/cookies beyond ID

### 7.4 Monitoring & Logging
- ✓ Audit log for admin actions
- ✓ Failed login attempt tracking
- ✓ Suspicious activity alerts
- ✓ Session revocation capability

---

## 8. Environment Variables

```
# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Facebook OAuth
FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx

# NextAuth
NEXTAUTH_SECRET=xxx (strong random string)
NEXTAUTH_URL=http://localhost:3000 (production URL in prod)

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Email Service (for confirmations)
EMAIL_SERVICE=sendgrid|resend|nodemailer
EMAIL_API_KEY=xxx
SENDER_EMAIL=noreply@justychoice.com

# MFA/TOTP
TOTP_WINDOW=2 (time window for TOTP)
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Setup NextAuth with Google & Facebook
- [ ] Create customer User model & schema
- [ ] Create Order model & schema
- [ ] Implement basic checkout flow (guest only)
- [ ] Test OAuth login

### Phase 2: Account Creation (Week 2)
- [ ] Add "Create Account" checkbox to checkout
- [ ] Implement duplicate email detection
- [ ] Auto account creation on checkout
- [ ] Guest order linking logic
- [ ] Order confirmation emails

### Phase 3: Admin Authentication (Week 3)
- [ ] Create Admin user model
- [ ] Implement admin signup via invitation
- [ ] Add basic password + email login for admin
- [ ] Implement TOTP setup & verification
- [ ] Create admin session management

### Phase 4: Admin Permissions (Week 4)
- [ ] Implement role-based permission system
- [ ] Create Admin/Manager middleware guards
- [ ] Add permission checks to all admin routes
- [ ] Build admin dashboard & product management
- [ ] Add order management panel

### Phase 5: Admin Invitations (Week 5)
- [ ] Build invitation generation system
- [ ] Email invitation sending
- [ ] Invitation acceptance flow
- [ ] Admin user management panel
- [ ] Revoke invitation capability

### Phase 6: Security & Monitoring (Week 6)
- [ ] Implement audit logging
- [ ] Add rate limiting
- [ ] Setup failed login tracking
- [ ] Add suspicious activity alerts
- [ ] Session revocation system
- [ ] Security testing & hardening

---

## 10. Database Collections Summary

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| users | Customer accounts | email, phone, googleId, facebookId, profile |
| admins | Admin/Manager accounts | email, password, role, mfa_factors |
| invitations | Admin invitations | email, role, token, status |
| orders | All orders (guest & registered) | orderNumber, userId, guestEmail, items, status |
| products | Product catalog | name, sku, price, category |
| sessions | Active sessions (NextAuth) | sessionToken, expires, user |
| accounts | OAuth account links | provider, providerAccountId, userId |
| audit_logs | Admin action tracking | adminId, action, changes, timestamp |

---

## 11. Flow Diagrams Summary

### Customer Onboarding
```
Homepage
  ↓
Add to Cart → Checkout
  ↓
Login (Google/Facebook) OR Guest
  ↓
Checkout Form (if first time or guest)
  │
  └→ [✓] Create Account? (optional)
      ↓
      If checked:
      ├─ Email exists? → Link to existing
      └─ New email? → Create account
      ↓
      Place Order
      ↓
      Confirmation Email
      ↓
      Can login next time for faster checkout
```

### Admin Onboarding
```
Existing Admin wants to invite Manager
  ↓
/admin/users → Send Invitation
  ↓
Enter: email, role (Manager)
  ↓
System sends email with invite link
  ↓
New Manager clicks link
  ↓
Verify: Email matches, token valid
  ↓
Create Account: name, phone, password
  ↓
Setup MFA: Scan QR code (TOTP) or use Passkey
  ↓
Manager account READY
  ↓
Manager can login to /admin
  ↓
On each login: email/password → MFA → session
```

---

## 12. Key Decisions & Rationale

| Decision | Why |
|----------|-----|
| No password for customers | Friction reduction, faster conversions |
| Google/Facebook OAuth | Industry standard, familiar to users |
| Guest checkout allowed | Highest conversion, no barriers |
| Optional account creation at checkout | Balance between retention & friction |
| Invite-only admin access | Security, prevents unauthorized access |
| MFA mandatory for admin | Industry security best practice |
| TOTP + Passkey options | User choice, both secure & accessible |
| No email verification mandatory | Lower friction, optional for trust features |
| Role-based Admin/Manager | Flexible team management, principle of least privilege |
| Audit logging for admins | Security, compliance, troubleshooting |

---

## 13. Testing Strategy

### Customer Auth Tests
- [ ] Google login flow
- [ ] Facebook login flow
- [ ] Guest checkout without account
- [ ] Duplicate email detection
- [ ] Auto account creation
- [ ] Guest order linking

### Admin Auth Tests
- [ ] Invitation generation & sending
- [ ] Invitation acceptance & account creation
- [ ] TOTP setup & verification
- [ ] Admin login with MFA
- [ ] Session expiry & revocation
- [ ] Failed login tracking

### Permission Tests
- [ ] Admin full access
- [ ] Manager limited access
- [ ] Customer cannot access admin
- [ ] Permission checks on all endpoints
- [ ] Audit log creation

---

## 14. Deployment Checklist

- [ ] All environment variables set in production
- [ ] HTTPS enabled on all routes
- [ ] CSRF tokens validated
- [ ] Rate limiting active
- [ ] Email service configured
- [ ] MongoDB indexes created (email, userId, invitationToken)
- [ ] Session secret strong & unique
- [ ] NextAuth callback URLs updated
- [ ] OAuth provider credentials verified
- [ ] Audit logging configured
- [ ] Error monitoring (Sentry/similar) setup
- [ ] Backup strategy in place

---

## Next Steps

1. Review this architecture with team/stakeholders
2. Start Phase 1 implementation
3. Setup development environment
4. Create MongoDB schemas
5. Configure NextAuth
6. Begin customer auth flow testing

---

**Last Updated**: May 5, 2026
**Status**: Ready for Implementation

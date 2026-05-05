# Quick Reference - Just Your Choice Auth System

## 🎯 For Customers

### Login
```
1. Click "Login with Google" or "Login with Facebook"
2. Authenticate with provider
3. Redirected back to site (logged in)
```

### Guest Checkout
```
1. Don't click login
2. Go to checkout
3. Fill: name, email, phone, address
4. (Optional) Check "Create Account for faster checkout"
5. Place order
6. Done! Can login next time with same email
```

### Create Account During Checkout
```
1. Fill checkout form
2. Check "Create Account for faster checkout"
3. If account exists: confirm merge
4. If new: account created automatically
5. Can login next time with Google/Facebook
```

---

## 👨‍💼 For Admins

### Get Invited
```
1. Receive email with invitation link
2. Click link
3. Choose password (strong requirements)
4. Enter name and phone
5. Follow MFA setup
6. Login with email + password + 2FA code
```

### Setup MFA (First Login)
```
1. After creating account
2. Scan QR code with Authenticator app
3. Enter 6-digit code from app
4. Save backup codes (in secure place)
5. MFA enabled
```

### Every Login
```
1. Enter email
2. Enter password
3. Enter 6-digit code from Authenticator app
4. Access admin panel
```

### Forgot MFA Code
```
Use one of your backup codes instead of app code
```

### Invite New Admin/Manager
```
1. Admin panel → Users
2. Click "Send Invitation"
3. Enter email, select role
4. Send
5. New admin receives email
6. They follow account creation flow
```

---

## 📊 Key URLs

| Page | URL |
|------|-----|
| Home | `/` |
| Checkout | `/checkout` |
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin` |
| Accept Invitation | `/admin/invitation/{token}` |
| Order Status | `/orders/{orderNumber}` |

---

## 🔑 Environment Variables Needed

```
NEXTAUTH_SECRET=xxxxxxx
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

FACEBOOK_CLIENT_ID=xxx
FACEBOOK_CLIENT_SECRET=xxx

MONGODB_URI=mongodb+srv://...
```

---

## 🐛 Common Issues

### "Email already exists"
- You have a registered account
- Use "Link to Account" during checkout
- Or login with Google/Facebook first

### "Invalid TOTP code"
- Check your system time is correct
- Allow ±2 time windows
- Try backup code instead

### "Account disabled"
- Too many failed login attempts (5+)
- Contact super admin to re-enable

### "Invitation expired"
- Ask admin to send new invitation
- Invitations valid for 24 hours

---

## 🛡️ Security Tips

- Never share your password
- Never share backup codes (unless account compromised)
- Enable TOTP immediately after admin invite
- Save backup codes in secure location
- Use strong unique passwords
- Keep Authenticator app updated
- Always logout after using admin panel

---

## 📞 Support Contacts

- **Password Issue**: Ask admin to send new invitation
- **Lost MFA**: Use backup codes or contact admin
- **Account Locked**: Contact super admin
- **Other Issues**: Contact support@justychoice.com

---

**Last Updated**: May 5, 2026

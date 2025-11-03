# Email Verification UI - Complete Registration Flow

## Overview
Users now complete a **two-step registration process** with email verification:
1. **Step 1**: Enter email, username, and password
2. **Step 2**: Enter 6-digit verification code sent to their email

## User Flow

### Registration (Step 1)
1. User navigates to `/auth/signin`
2. Clicks "Create account" tab
3. Fills in:
   - **Email** (must be from allowed domains: Gmail, Outlook, Yahoo, etc.)
   - **Username** (3-16 characters, alphanumeric + underscore/dot)
   - **Password** (minimum 8 characters, must include number or special character)
4. Clicks "Create account" button
5. System:
   - Creates `PendingUser` record in database
   - Generates random 6-digit verification code
   - Sends email via MailerSend with the code
   - Shows verification code input UI

### Email Verification (Step 2)
1. User checks their email inbox
2. Finds verification email from `login@optiplay.space`
3. Copies 6-digit code
4. Returns to registration page (still open)
5. Enters code in the large verification input field
6. Clicks "Verify email" button
7. System:
   - Validates code against `PendingUser` record
   - Creates actual `User` account with hashed password
   - Deletes `PendingUser` record
   - Automatically signs user in
   - Redirects to `/profile`

## UI Components

### Registration Form
- **Email field**: Standard email input
- **Username field**: With character count hint (3-16 chars)
- **Password field**: With real-time strength feedback
  - 🔴 **Weak**: < 8 characters
  - 🟡 **Fair**: 8+ chars but missing numbers/symbols
  - 🟡 **Good**: 8+ chars with numbers or symbols
  - 🟢 **Strong**: 12+ chars with uppercase, numbers, and symbols
- **Submit button**: "Create account" (disabled until all validations pass)

### Verification Code UI
- **Info box**: Shows the email address where code was sent
- **Code input**: 
  - Large centered input (text-2xl)
  - Auto-formats to 6 digits only
  - Monospaced font with wide letter spacing
  - Placeholder: "123456"
- **Submit button**: "Verify email" (disabled until 6 digits entered)
- **Back button**: Returns to registration form if user needs to change email/username

## API Endpoints

### POST `/api/auth/register`
**Purpose**: Create pending user and send verification email

**Request**:
```json
{
  "email": "user@gmail.com",
  "username": "OptiChamp",
  "password": "SecurePass123!"
}
```

**Response (Success)**:
```json
{
  "ok": true,
  "message": "Verification code sent to your email. Please check your inbox.",
  "requiresVerification": true
}
```

**Response (Error)**:
```json
{
  "ok": false,
  "error": "That username is already taken"
}
```

### POST `/api/auth/verify`
**Purpose**: Verify code and create actual user account

**Request**:
```json
{
  "email": "user@gmail.com",
  "code": "123456"
}
```

**Response (Success)**:
```json
{
  "ok": true,
  "message": "Email verified successfully! You can now sign in.",
  "user": {
    "email": "user@gmail.com",
    "name": "OptiChamp"
  }
}
```

**Response (Error)**:
```json
{
  "ok": false,
  "error": "Invalid or expired verification code"
}
```

## Email Template

**Subject**: Verify your OptiPlay account

**From**: OptiPlay <login@optiplay.space>

**Content**:
```
Welcome to OptiPlay!

Please verify your email address using this code:

[123456]  ← Large, bold 6-digit code

This code expires in 15 minutes.

If you didn't create an account, you can safely ignore this email.
```

## Security Features

### Rate Limiting
- **Registration attempts**: 3 per IP per 5 minutes
- **Email sends**: 5 per email address per hour
- **Verification attempts**: Built into NextAuth

### Spam Protection
- Disposable email detection
- IP blacklisting for abuse
- Honeypot fields (hidden from users)
- Browser header validation
- Submission speed checks

### Data Protection
- Passwords hashed with bcrypt (cost factor 12)
- Verification codes expire after 15 minutes
- Pending users auto-deleted after expiration
- Code stored as hashed value in database
- Auto-login uses password from memory (cleared after verification)

## Database Tables

### PendingUser
**Purpose**: Temporary storage for unverified registrations

| Column | Type | Description |
|--------|------|-------------|
| id | String | CUID primary key |
| email | String | User's email (unique) |
| username | String | Chosen username |
| passwordHash | String | Bcrypt hash of password |
| verificationCode | String | 6-digit numeric code |
| expiresAt | DateTime | Code expiration (15 mins) |
| ipAddress | String | Registration IP for security |
| createdAt | DateTime | Registration timestamp |

### User
**Purpose**: Actual user accounts (created after verification)

| Column | Type | Description |
|--------|------|-------------|
| id | String | CUID primary key |
| name | String | Username (unique) |
| email | String | Email (unique) |
| passwordHash | String | Bcrypt hash |
| emailVerified | DateTime | Verification timestamp |
| isOwner | Boolean | Admin status |
| isOG | Boolean | OG badge status |
| ... | ... | Other profile fields |

## Development vs Production

### Development Mode
When `MAILERSEND_API_TOKEN` is not set:
- Verification code printed to terminal console
- No actual email sent
- Allows testing without email service
- Code displayed in formatted box:
```
====================================
📧 EMAIL VERIFICATION CODE (DEV MODE)
====================================
To: user@gmail.com
Username: OptiChamp
Code: 123456
====================================
```

### Production Mode
When `MAILERSEND_API_TOKEN` is set (Vercel environment):
- Real emails sent via MailerSend API
- Rate limiting enforced
- Error logging to Vercel logs
- Full spam protection active

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check MailerSend dashboard for delivery status
4. Ensure domain (optiplay.space) is verified
5. Check rate limit (max 5 emails/hour per address)

### "Invalid verification code"
1. Code may have expired (15 minute limit)
2. Check for typos in 6-digit code
3. Ensure email address matches exactly
4. Try registering again to get fresh code

### Auto-login Fails
1. User account created but sign-in failed
2. Manual sign-in should work with password
3. Check browser console for errors
4. Verify credentials provider is enabled

## Next Steps

### Future Enhancements
- [ ] Resend code button (with rate limiting)
- [ ] Code expiration timer display
- [ ] Email change option before verification
- [ ] SMS verification as alternative
- [ ] Social auth (Google, Discord) integration
- [ ] Account recovery via email

### Testing Checklist
- [ ] Register with valid email
- [ ] Check email received within 1 minute
- [ ] Verify code works on first try
- [ ] Test expired code (wait 15+ mins)
- [ ] Test invalid code (wrong digits)
- [ ] Test back button functionality
- [ ] Verify auto-login after verification
- [ ] Test duplicate email registration
- [ ] Test duplicate username registration
- [ ] Check spam protection triggers

## Deployment Status
✅ **Deployed**: Commit `f562e50` pushed to `main`
✅ **Production**: Live at https://optiplay.space/auth/signin
✅ **Vercel**: Environment variables configured
✅ **Database**: PendingUser table exists
✅ **Email**: MailerSend configured with optiplay.space domain

---

**Last Updated**: November 3, 2025  
**Author**: GitHub Copilot  
**Version**: 1.0

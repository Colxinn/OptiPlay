# Email Verification System

## Overview
OptiPlay now requires email verification for all new user registrations to prevent spam and ensure users own the emails they register with.

## How It Works

### Registration Flow
1. User submits registration form (email, username, password)
2. System validates email and creates a **PendingUser** record
3. 6-digit verification code is generated and sent via MailerSend
4. Code expires in 15 minutes
5. User enters code on verification page
6. Upon successful verification, actual **User** account is created
7. User can now sign in

### Existing Users
- All existing accounts remain unchanged
- Existing users can continue signing in normally
- Email verification only applies to NEW registrations

## API Endpoints

### `POST /api/auth/register`
Creates pending user and sends verification email.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Verification code sent to your email. Please check your inbox.",
  "requiresVerification": true
}
```

### `POST /api/auth/verify`
Verifies code and creates actual user account.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Email verified successfully! You can now sign in.",
  "user": {
    "email": "user@example.com",
    "name": "username"
  }
}
```

### `POST /api/auth/resend-code`
Resends verification code (rate limited: 3 per 15 minutes).

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Verification code resent. Please check your email."
}
```

## Database Schema

### PendingUser Table
```sql
CREATE TABLE "PendingUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "verificationCode" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## MailerSend Integration

### Required Environment Variables
```bash
# Get API key from: https://www.mailersend.com/
MAILERSEND_API_KEY=your_api_key_here
MAILERSEND_FROM_EMAIL=noreply@optiplay.gg
MAILERSEND_FROM_NAME=OptiPlay
```

### Email Template
The verification email includes:
- OptiPlay branding with gradient logo
- Personalized welcome message
- Large, easy-to-read 6-digit code
- 15-minute expiration notice
- Security notice for unauthorized requests
- Both HTML and plain text versions

### Development Mode
If `MAILERSEND_API_KEY` is not set and `NODE_ENV=development`:
- Emails are logged to console instead of sent
- Shows verification code in terminal
- Useful for local testing without email service

## Admin Features

### Delete Users
Owners can permanently delete users from the User Directory:

**DELETE Button:**
- Red button with 🗑️ icon
- Requires typing `DELETE username` to confirm
- Deletes user and ALL related data:
  - Posts
  - Comments
  - Votes
  - Poll votes
  - Profile comments
  - Access logs
  - Mute audit records

**Restrictions:**
- Cannot delete yourself
- Cannot delete other owners
- Shows confirmation message after deletion

**API Endpoint:** `DELETE /api/admin/users/[id]/delete`

## Security Features

### Multi-Layer Protection (from SPAM_PROTECTION.md)
All 13 spam protection layers still apply:
1. IP Blacklist check
2. IP Abuse detection
3. Browser validation
4. Rate limiting (3 registrations per 5 min)
5. Honeypot fields
6. Submission speed check
7. Email format validation
8. **Disposable email blocking (400+ domains)**
9. Suspicious pattern detection
10. Legacy spam check
11. Username validation
12. Username sanitization
13. Content moderation

### Email Verification Adds:
14. **Email ownership verification**
15. **Temporary pending user storage**
16. **Auto-cleanup of expired codes**

## Cleanup

### Expired Pending Users
Pending users with expired codes should be cleaned up periodically.

**Manual cleanup:**
```javascript
import { cleanupExpiredPendingUsers } from '@/lib/emailVerification';
const deleted = await cleanupExpiredPendingUsers();
console.log(`Cleaned up ${deleted} expired pending users`);
```

**Recommended:** Set up a cron job to run this daily.

## Testing

### Local Development
1. Set `NODE_ENV=development` in `.env`
2. Omit `MAILERSEND_API_KEY` 
3. Register a new user
4. Check terminal for verification code
5. Use code to verify email

### Production Testing
1. Add `MAILERSEND_API_KEY` to Vercel environment variables
2. Verify domain in MailerSend dashboard
3. Set `MAILERSEND_FROM_EMAIL` to verified sender
4. Register with a real email
5. Check inbox for verification code

## Deployment Checklist

- [ ] Add `MAILERSEND_API_KEY` to Vercel environment variables
- [ ] Verify domain/sender in MailerSend dashboard  
- [ ] Set `MAILERSEND_FROM_EMAIL` to verified sender address
- [ ] Test registration flow in production
- [ ] Set up cron job for expired pending user cleanup
- [ ] Update registration UI to show verification step
- [ ] Add verification code input page/modal

## Future Enhancements

- [ ] Add email verification UI components
- [ ] Implement "magic link" option (alternative to code)
- [ ] Add resend code button with countdown timer
- [ ] Track verification attempts in analytics
- [ ] Add email change verification for existing users
- [ ] Implement rate limiting on verification attempts

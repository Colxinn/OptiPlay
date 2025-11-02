# Spam Protection Guide

## 🛡️ Protection Measures Deployed

### 1. Rate Limiting
- **Global**: 100 requests/minute per IP
- **Registration**: 3 attempts per 5 minutes per IP
- **Posts**: 5 posts per hour per user
- **Comments**: 10 comments per minute per user

### 2. Email Protection
Blocks these disposable email domains:
- tempmail.com, guerrillamail.com, 10minutemail.com
- mailinator.com, yopmail.com, maildrop.cc
- sharklasers.com, trashmail.com, and 12+ more

Also blocks emails with:
- Too many consecutive numbers (10+)
- Repeated characters (6+)
- Suspiciously long random strings

### 3. Username Validation
- Length: 3-20 characters
- Allowed: letters, numbers, underscore, hyphen
- Must start with letter or number
- Blocks spam patterns (repeated chars, too long random)

### 4. Content Validation
- Post titles: max 200 characters
- Post content: max 10,000 characters
- Comments: max 2,000 characters
- All fields required and validated

## 🧹 Cleaning Up Spam

### Preview spam users (safe, doesn't delete):
```bash
node cleanup-spam.js
```

### Actually delete spam users:
```bash
node cleanup-spam.js delete
```

The script will:
1. Scan all users for spam patterns
2. Identify disposable emails
3. List all potential spam accounts
4. Delete their posts, comments, and votes
5. Remove the spam users

**Note**: Owner accounts are NEVER deleted.

## 📊 What's Protected Now

✅ Registration endpoint - strict rate limiting + spam email blocking
✅ Post creation - rate limiting + content validation  
✅ Comment creation - rate limiting + content validation
✅ Global API - 100 req/min per IP maximum
✅ Admin panel - owner-only access

## 🚨 If You Get Spammed Again

1. Check the pattern in the spam data
2. Add to `lib/spamProtection.js` disposable domains or patterns
3. Run `node cleanup-spam.js delete` to clean up
4. Tighten rate limits in `lib/rateLimit.js` if needed

## 💡 Rate Limit Customization

Edit `lib/rateLimit.js` to adjust limits:
```javascript
rateLimit(identifier, limit, windowMs)
// limit = number of requests
// windowMs = time window in milliseconds
```

Example limits:
- `rateLimit(ip, 10, 60000)` = 10 per minute
- `rateLimit(ip, 3, 300000)` = 3 per 5 minutes
- `rateLimit(ip, 100, 3600000)` = 100 per hour

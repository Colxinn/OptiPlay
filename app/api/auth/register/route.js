import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { assertCleanUsername } from "@/lib/contentModeration";
import { getOGBadgeData } from "@/lib/ogBadge";
import { strictRateLimit } from "@/lib/rateLimit";
import { isSpamEmail, isValidUsername, sanitizeUsername } from "@/lib/spamProtection";
import { isDisposableEmail, containsSuspiciousPatterns } from "@/lib/emailValidation";
import { isHoneypotFilled, isSubmissionTooFast, validateBrowserHeaders } from "@/lib/honeypot";
import { isBlacklistedIP, trackIPActivity, isIPAbusive, blacklistIP } from "@/lib/ipBlacklist";

function badRequest(message, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const ownerEmailSet = new Set(
  (process.env.OWNER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export async function POST(req) {
  // Get client IP for rate limiting and blacklist checking
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // LAYER 1: IP Blacklist Check
  if (isBlacklistedIP(ip)) {
    return badRequest("Access denied. Your IP has been blocked due to suspicious activity.", 403);
  }
  
  // LAYER 2: IP Abuse Detection
  if (isIPAbusive(ip)) {
    return badRequest("Too many requests from your IP. Please try again later.", 429);
  }
  
  // LAYER 3: Browser Validation (detect headless browsers/bots)
  if (!validateBrowserHeaders(req.headers)) {
    blacklistIP(ip, 'Invalid browser headers');
    return badRequest("Invalid request. Please use a standard web browser.", 403);
  }
  
  // LAYER 4: Strict rate limiting: 3 registration attempts per 5 minutes per IP
  const rateLimitResult = strictRateLimit(ip, 3, 300000);
  if (!rateLimitResult.success) {
    blacklistIP(ip, 'Rate limit exceeded');
    return badRequest("Too many registration attempts. Please try again later.", 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  // LAYER 5: Honeypot Check (bots fill hidden fields)
  if (isHoneypotFilled(body)) {
    blacklistIP(ip, 'Honeypot triggered');
    return badRequest("Registration failed. Please try again.", 400);
  }
  
  // LAYER 6: Submission Speed Check (too fast = bot)
  if (isSubmissionTooFast(ip, 2)) {
    blacklistIP(ip, 'Submission too fast');
    return badRequest("Please slow down and try again.", 429);
  }

  const emailRaw = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  // LAYER 7: Email validation and spam checks
  if (!emailRaw || !emailRaw.includes("@")) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Please provide a valid email address");
  }

  // LAYER 8: Block disposable emails (comprehensive list)
  if (isDisposableEmail(emailRaw)) {
    trackIPActivity(ip, 'register_spam');
    blacklistIP(ip, 'Disposable email attempt');
    return badRequest("Disposable email addresses are not allowed. Please use a permanent email address.");
  }
  
  // LAYER 9: Detect suspicious email patterns
  if (containsSuspiciousPatterns(emailRaw)) {
    trackIPActivity(ip, 'register_spam');
    blacklistIP(ip, 'Suspicious email pattern');
    return badRequest("Email address appears to be invalid. Please use a real email address.");
  }

  // LAYER 10: Block spam/disposable emails (legacy check)
  if (isSpamEmail(emailRaw)) {
    trackIPActivity(ip, 'register_spam');
    return badRequest("Please use a valid email address. Temporary/disposable emails are not allowed.");
  }

  // LAYER 11: Enhanced username validation
  if (!isValidUsername(username)) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens");
  }

  // LAYER 12: Sanitize username
  const cleanUsername = sanitizeUsername(username);
  if (!cleanUsername || cleanUsername !== username) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Username contains invalid characters");
  }

  if (username.length < 3 || username.length > 16) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Username must be between 3 and 16 characters");
  }
  if (!/^[a-zA-Z0-9_\.]+$/.test(username)) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Username can only contain letters, numbers, underscores or dots");
  }
  
  // LAYER 13: Content moderation
  try {
    assertCleanUsername(username);
  } catch (err) {
    trackIPActivity(ip, 'register_fail');
    return badRequest(err.message || "Username contains blocked language");
  }

  if (password.length < 8) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Password must be at least 8 characters long");
  }
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasNumber && !hasSpecial) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Password must include a number or special character");
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      name: username,
      NOT: { email: emailRaw },
    },
  });
  if (existingUsername) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("That username is already taken", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email: emailRaw } });
  const shouldBeOwner = ownerEmailSet.has(emailRaw);
  const ogData = getOGBadgeData(); // Check if user qualifies for OG badge

  if (!existing) {
    await prisma.user.create({
      data: {
        email: emailRaw,
        name: username,
        passwordHash,
        bio: "",
        isOwner: shouldBeOwner,
        ...ogData, // Grant OG status if within eligibility period
      },
    });
    trackIPActivity(ip, 'register_success');
  } else if (existing.emailVerified) {
    trackIPActivity(ip, 'register_fail');
    return badRequest("Account already exists. Use sign in instead.", 409);
  } else {
    await prisma.user.update({
      where: { email: emailRaw },
      data: {
        name: username,
        passwordHash,
        ...(shouldBeOwner ? { isOwner: true } : {}),
        ...ogData, // Grant OG status if within eligibility period
      },
    });
    trackIPActivity(ip, 'register_success');
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

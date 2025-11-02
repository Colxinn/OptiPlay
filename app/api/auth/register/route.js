import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { assertCleanUsername } from "@/lib/contentModeration";
import { getOGBadgeData } from "@/lib/ogBadge";
import { strictRateLimit } from "@/lib/rateLimit";
import { isSpamEmail, isValidUsername, sanitizeUsername } from "@/lib/spamProtection";

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
  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Strict rate limiting: 3 registration attempts per 5 minutes per IP
  const rateLimitResult = strictRateLimit(ip, 3, 300000);
  if (!rateLimitResult.success) {
    return badRequest("Too many registration attempts. Please try again later.", 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  const emailRaw = String(body.email || "").trim().toLowerCase();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  // Email validation and spam checks
  if (!emailRaw || !emailRaw.includes("@")) {
    return badRequest("Please provide a valid email address");
  }

  // Block spam/disposable emails
  if (isSpamEmail(emailRaw)) {
    return badRequest("Please use a valid email address. Temporary/disposable emails are not allowed.");
  }

  // Enhanced username validation
  if (!isValidUsername(username)) {
    return badRequest("Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens");
  }

  // Sanitize username
  const cleanUsername = sanitizeUsername(username);
  if (!cleanUsername || cleanUsername !== username) {
    return badRequest("Username contains invalid characters");
  }

  if (username.length < 3 || username.length > 16) {
    return badRequest("Username must be between 3 and 16 characters");
  }
  if (!/^[a-zA-Z0-9_\.]+$/.test(username)) {
    return badRequest("Username can only contain letters, numbers, underscores or dots");
  }
  try {
    assertCleanUsername(username);
  } catch (err) {
    return badRequest(err.message || "Username contains blocked language");
  }

  if (password.length < 8) {
    return badRequest("Password must be at least 8 characters long");
  }
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasNumber && !hasSpecial) {
    return badRequest("Password must include a number or special character");
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      name: username,
      NOT: { email: emailRaw },
    },
  });
  if (existingUsername) {
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
  } else if (existing.emailVerified) {
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
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

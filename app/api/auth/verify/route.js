import { verifyAndCreateUser } from "@/lib/emailVerification";
import { getOGBadgeData } from "@/lib/ogBadge";
import prisma from "@/lib/prisma";

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
  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();

  if (!email || !code) {
    return badRequest("Email and verification code are required");
  }

  // Verify code and create user
  const result = await verifyAndCreateUser(email, code);

  if (!result.success) {
    return badRequest(result.error, 400);
  }

  // Update user with owner status and OG badge if applicable
  const shouldBeOwner = ownerEmailSet.has(email);
  const ogData = getOGBadgeData();

  if (shouldBeOwner || ogData.isOG) {
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        ...(shouldBeOwner ? { isOwner: true } : {}),
        ...ogData,
      },
    });
  }

  return new Response(
    JSON.stringify({ 
      ok: true, 
      message: "Email verified successfully! You can now sign in.",
      user: {
        email: result.user.email,
        name: result.user.name
      }
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

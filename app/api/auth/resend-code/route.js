import { resendVerificationCode } from "@/lib/emailVerification";
import { strictRateLimit } from "@/lib/rateLimit";

function badRequest(message, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // Rate limit: 3 resends per 15 minutes
  const rateLimitResult = strictRateLimit(`resend:${ip}`, 3, 900000);
  if (!rateLimitResult.success) {
    return badRequest("Too many resend attempts. Please try again later.", 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return badRequest("Email is required");
  }

  const result = await resendVerificationCode(email);

  if (!result.success) {
    return badRequest(result.error, 400);
  }

  return new Response(
    JSON.stringify({ 
      ok: true, 
      message: "Verification code resent. Please check your email."
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

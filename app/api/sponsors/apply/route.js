import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getClientIp(req) {
  const header = req.headers.get("x-forwarded-for") || "";
  const ip = header.split(",")[0]?.trim();
  if (ip) return ip;
  return req.headers.get("x-real-ip") || null;
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Sign-in required." }),
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return new Response(
      JSON.stringify({ error: "Invalid request payload." }),
      { status: 400 }
    );
  }

  const {
    platformStatus,
    platformDetails,
    postsLongVideos,
    contentRelevant,
    sponsorshipType,
    contactEmail,
    proof,
    termsAgreed,
  } = body;

  if (!contactEmail || typeof contactEmail !== "string" || !contactEmail.includes("@")) {
    return new Response(
      JSON.stringify({ error: "Valid contact email required." }),
      { status: 400 }
    );
  }

  if (!proof || typeof proof !== "string" || proof.trim().length < 6) {
    return new Response(
      JSON.stringify({ error: "Attach or link proof of followers/sub count." }),
      { status: 400 }
    );
  }

  if (sponsorshipType !== "individual" && sponsorshipType !== "team") {
    return new Response(
      JSON.stringify({ error: "Select individual or team sponsorship." }),
      { status: 400 }
    );
  }

  if (platformStatus !== "yes" && platformStatus !== "other") {
    return new Response(
      JSON.stringify({ error: "Select if you meet the follower criteria." }),
      { status: 400 }
    );
  }

  if (platformStatus === "other") {
    if (!platformDetails || typeof platformDetails !== "string" || platformDetails.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Provide details for your other platform." }),
        { status: 400 }
      );
    }
  }

  if (typeof postsLongVideos !== "boolean" || typeof contentRelevant !== "boolean") {
    return new Response(
      JSON.stringify({ error: "Eligibility confirmations are required." }),
      { status: 400 }
    );
  }

  if (!postsLongVideos || !contentRelevant) {
    return new Response(
      JSON.stringify({ error: "You must meet the content eligibility requirements." }),
      { status: 400 }
    );
  }

  if (!termsAgreed) {
    return new Response(
      JSON.stringify({ error: "You must agree to OptiPlay sponsor terms." }),
      { status: 400 }
    );
  }

  const ipAddress = getClientIp(req);
  if (ipAddress) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.sponsorApplication.findFirst({
      where: {
        ipAddress,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    if (recent) {
      return new Response(
        JSON.stringify({ error: "Limit one sponsorship application per day. Try again tomorrow." }),
        { status: 429 }
      );
    }
  }

  await prisma.sponsorApplication.create({
    data: {
      userId: session.user.id,
      ipAddress,
      platformStatus,
      platformDetails: platformStatus === "other" ? (platformDetails || "").trim() : null,
      postsLongVideos,
      contentRelevant,
      sponsorshipType,
      contactEmail: contactEmail.trim(),
      proof: proof.trim(),
      termsAgreed: Boolean(termsAgreed),
    },
  });

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 201 }
  );
}

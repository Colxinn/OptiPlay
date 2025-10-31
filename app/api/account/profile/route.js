import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { assertCleanUsername, ensureCleanContent } from "@/lib/contentModeration";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400);
  }

  const username = String(body.username || "").trim();
  const bio = String(body.bio || "").trim();
  const avatarData = typeof body.avatarData === "string" ? body.avatarData.trim() : "";
  const removeAvatar = Boolean(body.removeAvatar);

  if (username.length < 3 || username.length > 16) {
    return json(
      { ok: false, error: "Username must be between 3 and 16 characters." },
      400
    );
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return json(
      { ok: false, error: "Username may only contain letters, numbers, underscores, or dots." },
      400
    );
  }
  try {
    assertCleanUsername(username);
  } catch (err) {
    return json({ ok: false, error: err.message || "Username contains blocked language." }, 400);
  }
  if (bio.length > 500) {
    return json(
      { ok: false, error: "Bio must be 500 characters or fewer." },
      400
    );
  }
  try {
    ensureCleanContent(bio, { allowLinks: true });
  } catch (err) {
    return json({ ok: false, error: err.message || "Bio contains blocked content." }, 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  if (!existingUser) {
    return json({ ok: false, error: "User not found." }, 404);
  }

  const usernameConflict = await prisma.user.findFirst({
    where: {
      name: username,
      NOT: { id: session.user.id },
    },
  });
  if (usernameConflict) {
    return json({ ok: false, error: "That username is already taken." }, 409);
  }

  let imageValue = existingUser.image || null;
  if (removeAvatar) {
    imageValue = null;
  } else if (avatarData) {
    const match = avatarData.match(/^data:image\/(png|jpeg);base64,/i);
    if (!match) {
      return json(
        { ok: false, error: "Profile image must be a PNG or JPEG file." },
        400
      );
    }
    const base64 = avatarData.split(",")[1] || "";
    const sizeBytes = Math.ceil((base64.length * 3) / 4);
    if (sizeBytes > 2 * 1024 * 1024) {
      return json(
        { ok: false, error: "Profile image must be smaller than 2MB." },
        400
      );
    }
    imageValue = avatarData;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: username,
      bio,
      image: imageValue,
    },
  });

  return json({ ok: true });
}

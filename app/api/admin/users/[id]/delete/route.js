import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    return json({ error: "Forbidden. Owner access required." }, 403);
  }

  const { id } = await params;
  if (!id) {
    return json({ error: "Missing user id" }, 400);
  }

  // Prevent deleting yourself
  if (session.user.id === id) {
    return json({ error: "You cannot delete your own account." }, 400);
  }

  // Check if user exists
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, isOwner: true },
  });

  if (!target) {
    return json({ error: "User not found." }, 404);
  }

  // Prevent deleting other owners (safety)
  if (target.isOwner) {
    return json({ error: "Cannot delete owner accounts." }, 400);
  }

  // Delete user and all related data (cascading deletes via Prisma schema)
  // This will delete: posts, comments, votes, pollVotes, profileComments, etc.
  await prisma.user.delete({
    where: { id },
  });

  return json({
    ok: true,
    message: `User ${target.name} (${target.email}) has been permanently deleted.`,
    deletedUser: {
      id: target.id,
      email: target.email,
      name: target.name,
    },
  });
}

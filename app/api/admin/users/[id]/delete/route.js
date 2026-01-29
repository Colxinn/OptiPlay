import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.isOwner) return new Response(JSON.stringify({ error: "Owner only" }), { status: 403 });
  const { id } = params;
  await prisma.user.delete({ where: { id } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

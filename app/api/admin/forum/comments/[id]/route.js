import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session?.user?.isOwner) return new Response(JSON.stringify({ error: 'Owner only' }), { status: 403 });
  const { id } = params;
  const { action } = await req.json();
  if (!['remove', 'restore'].includes(action)) return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  const isRemoved = action === 'remove';
  const comment = await prisma.comment.update({ where: { id }, data: { isRemoved } });
  return new Response(JSON.stringify({ ok: true, comment }), { status: 200 });
}


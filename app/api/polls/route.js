
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Auth required" }), { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, isOwner: true },
  });

  if (!me?.isOwner) {
    return new Response(JSON.stringify({ error: "Owner only" }), { status: 403 });
  }

  const { question, game, options, startsAt, endsAt } = await req.json();
  const parsedStarts = new Date(startsAt);
  const parsedEnds = new Date(endsAt);

  if (!question || !options?.length) {
    return new Response(JSON.stringify({ error: "Question and options required." }), {
      status: 400,
    });
  }

  if (Number.isNaN(parsedStarts.getTime()) || Number.isNaN(parsedEnds.getTime())) {
    return new Response(JSON.stringify({ error: "Valid start/end dates required." }), {
      status: 400,
    });
  }

  if (parsedEnds <= parsedStarts) {
    return new Response(JSON.stringify({ error: "End time must be after start time." }), {
      status: 400,
    });
  }

  const slug = parsedStarts.toISOString().slice(0, 10);

  await prisma.poll.updateMany({
    where: { endsAt: { gt: parsedStarts } },
    data: { endsAt: parsedStarts },
  });

  const poll = await prisma.poll.create({
    data: {
      slug,
      question,
      game,
      startsAt: parsedStarts,
      endsAt: parsedEnds,
      createdById: me.id,
      options: { create: options.map((text) => ({ text })) },
    },
    include: { options: true },
  });

  return new Response(JSON.stringify({ poll }), { status: 201 });
}

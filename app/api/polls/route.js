
import { auth } from '../../../lib/auth'; import prisma from '../../../lib/prisma';
export async function POST(req){ const session=await auth(); if(!session?.user?.email) return new Response(JSON.stringify({error:'Auth required'}),{status:401});
  const me = await prisma.user.findUnique({ where:{ email: session.user.email } }); if(!me?.isOwner) return new Response(JSON.stringify({error:'Owner only'}),{status:403});
  const { question, game, options, startsAt, endsAt } = await req.json(); const slug=new Date(startsAt).toISOString().slice(0,10);
  const poll = await prisma.poll.create({ data:{ slug, question, game, startsAt:new Date(startsAt), endsAt:new Date(endsAt), options:{ create: options.map(t=>({ text:t })) } }, include:{ options:true } });
  return new Response(JSON.stringify({ poll }), { status:201 }); }
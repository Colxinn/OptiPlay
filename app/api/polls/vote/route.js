
import { auth } from '../../../../lib/auth'; import prisma from '../../../../lib/prisma';
export async function POST(req){ const session=await auth(); if(!session?.user?.email) return new Response(JSON.stringify({error:'Auth required'}),{status:401});
  const { pollId, optionId } = await req.json();
  const user = await prisma.user.upsert({ where:{ email: session.user.email }, update:{}, create:{ email: session.user.email, name: session.user.name||null, image: session.user.image||null } });
  try{ await prisma.pollVote.create({ data:{ userId:user.id, pollId, optionId } }); }catch(e){ return new Response(JSON.stringify({error:'Already voted'}),{status:409}); }
  const votes = await prisma.pollVote.findMany({ where:{ pollId } }); const options = await prisma.pollOption.findMany({ where:{ pollId } });
  const tallies={}; options.forEach(o=>tallies[o.id]=0); votes.forEach(v=>tallies[v.optionId]=(tallies[v.optionId]||0)+1);
  return new Response(JSON.stringify({ ok:true, tallies, total:votes.length }), { status:200 }); }
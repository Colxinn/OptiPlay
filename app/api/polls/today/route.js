
import prisma from '../../../../lib/prisma';
export async function GET(){ const now=new Date(); const poll=await prisma.poll.findFirst({ where:{ startsAt:{ lte:now }, endsAt:{ gte:now } }, include:{ options:true, votes:true } }); if(!poll) return new Response(JSON.stringify({poll:null}),{status:200});
  const tallies={}; poll.options.forEach(o=>tallies[o.id]=0); poll.votes.forEach(v=>tallies[v.optionId]=(tallies[v.optionId]||0)+1);
  return new Response(JSON.stringify({ poll, tallies, total: poll.votes.length }), { status:200 }); }
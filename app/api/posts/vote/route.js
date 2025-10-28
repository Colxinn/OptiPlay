import prisma from '../../../../lib/prisma';

export async function POST(req){
  const body = await req.json();
  const { postId, value } = body;
  const dev = req.headers.get('x-dev-user');
  if (!dev) return new Response(JSON.stringify({ error:'Auth required (dev)' }), { status:401 });
  const userObj = JSON.parse(dev);
  let user = await prisma.user.findUnique({ where: { email: userObj.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: userObj.email, name: userObj.name, isOwner: userObj.isOwner || false } });
  }
  await prisma.vote.create({ data: { value: Number(value), userId: user.id, postId } });
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}

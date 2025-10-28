import prisma from '@/lib/prisma';

export async function POST(req){
  const body = await req.json();
  const { postId, content } = body;
  const dev = req.headers.get('x-dev-user');
  if (!dev) return new Response(JSON.stringify({ error:'Auth required (dev)' }), { status:401 });
  const userObj = JSON.parse(dev);
  let user = await prisma.user.findUnique({ where: { email: userObj.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: userObj.email, name: userObj.name, isOwner: userObj.isOwner || false } });
  }
  const comment = await prisma.comment.create({ data: { content, authorId: user.id, postId } });
  return new Response(JSON.stringify(comment), { status:201 });
}

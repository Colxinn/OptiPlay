import prisma from '../../../lib/prisma';

export async function GET(req) {
  const posts = await prisma.post.findMany({ include:{ author:true, comments:true, votes:true }, orderBy:{ createdAt: 'desc' } });
  return new Response(JSON.stringify({ posts }), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  let author = null;
  try {
    const dev = req.headers.get('x-dev-user');
    if (dev) {
      author = JSON.parse(dev);
      let user = await prisma.user.findUnique({ where: { email: author.email } });
      if (!user) {
        user = await prisma.user.create({ data: { email: author.email, name: author.name, image: author.image || null, isOwner: author.isOwner || false } });
      }
      const post = await prisma.post.create({ data: { title: body.title, content: body.content, authorId: user.id } });
      return new Response(JSON.stringify(post), { status: 201 });
    }
  } catch(e){ console.error(e) }

  return new Response(JSON.stringify({ error: 'Auth required in dev mode (set x-dev-user header)' }), { status: 401 });
}

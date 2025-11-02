import prisma from '../../../lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

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
      
      // Rate limit: 5 posts per hour per user
      const rateLimitResult = rateLimit(`post:${author.email}`, 5, 3600000);
      if (!rateLimitResult.success) {
        return new Response(JSON.stringify({ error: 'Too many posts. Please wait before posting again.' }), { status: 429 });
      }
      
      // Validate content
      if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Post title is required' }), { status: 400 });
      }
      
      if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Post content is required' }), { status: 400 });
      }
      
      if (body.title.length > 200) {
        return new Response(JSON.stringify({ error: 'Title is too long (max 200 characters)' }), { status: 400 });
      }
      
      if (body.content.length > 10000) {
        return new Response(JSON.stringify({ error: 'Content is too long (max 10000 characters)' }), { status: 400 });
      }
      
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

import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req){
  const body = await req.json();
  const { postId, content } = body;
  const dev = req.headers.get('x-dev-user');
  if (!dev) return new Response(JSON.stringify({ error:'Auth required (dev)' }), { status:401 });
  const userObj = JSON.parse(dev);
  
  // Rate limit: 10 comments per minute per user
  const rateLimitResult = rateLimit(`comment:${userObj.email}`, 10, 60000);
  if (!rateLimitResult.success) {
    return new Response(JSON.stringify({ error: 'Too many comments. Please slow down.' }), { status: 429 });
  }
  
  // Validate content
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Comment content is required' }), { status: 400 });
  }
  
  if (content.length > 2000) {
    return new Response(JSON.stringify({ error: 'Comment is too long (max 2000 characters)' }), { status: 400 });
  }
  
  let user = await prisma.user.findUnique({ where: { email: userObj.email } });
  if (!user) {
    user = await prisma.user.create({ data: { email: userObj.email, name: userObj.name, isOwner: userObj.isOwner || false } });
  }
  const comment = await prisma.comment.create({ data: { content, authorId: user.id, postId } });
  return new Response(JSON.stringify(comment), { status:201 });
}

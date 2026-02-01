import prisma from '../../../../lib/prisma';

export async function GET(req, { params }){
  const { id } = await params;
  const post = await prisma.post.findUnique({ where:{ id }, include:{ author:true } });
  const comments = await prisma.comment.findMany({ where:{ postId: id }, include:{ author:true }, orderBy:{ createdAt:'asc' } });
  const count = await prisma.vote.count({ where:{ postId: id } });
  const postWithCount = { ...post, _count: { votes: count } };
  return new Response(JSON.stringify({ post: postWithCount, comments }), { status: 200 });
}

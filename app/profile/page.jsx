import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      bio: true,
      image: true,
      isOwner: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return <ProfileClient user={user} />;
}

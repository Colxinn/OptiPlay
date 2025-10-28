import { auth } from '@/lib/auth';
import ProfileClient from './ProfileClient';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }
  return <ProfileClient userEmail={session.user.email} />;
}


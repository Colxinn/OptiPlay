<<<<<<< HEAD
export const runtime = 'nodejs';
export { handlers as GET, handlers as POST } from "@/lib/auth";
=======
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import prisma from '../../../../lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const owners = await prisma.user.count({ where: { isOwner: true } });
      if (owners === 0) {
        await prisma.user.update({ where: { id: user.id }, data: { isOwner: true } });
      }
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/api/auth/signin'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
>>>>>>> origin/main

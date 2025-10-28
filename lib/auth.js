import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import prisma from "./prisma";

// parse env lists
const ownerEmails = (process.env.OWNER_EMAILS || "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

function checkIsOwner(user) {
  const email = (user?.email || "").toLowerCase();
  const byEmail = email && ownerEmails.includes(email);
  return !!byEmail;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Use JWT sessions so auth() works in Edge middleware without Prisma
  session: { strategy: "jwt" },
  // Custom pages to avoid opaque 500s and surface provider errors
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (checkIsOwner(user)) {
          // Set on the in-memory user for the first JWT mint; DB update is handled in events.signIn
          user.isOwner = true;
        }
      } catch {}
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, persist isOwner onto the token
      if (user) {
        token.isOwner = !!user.isOwner;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.isOwner = !!token.isOwner;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      // After sign-in completes and the user exists in DB, mark owner in DB without failing the flow
      try {
        if (checkIsOwner(user)) {
          await prisma.user.update({ where: { id: user.id }, data: { isOwner: true } }).catch(async () => {
            if (user.email) {
              await prisma.user.update({ where: { email: user.email }, data: { isOwner: true } }).catch(() => {});
            }
          });
        }
      } catch {}
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});

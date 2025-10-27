import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import prisma from "./prisma";

// parse env lists
const ownerEmails = (process.env.OWNER_EMAILS || "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
const ownerDiscordIds = (process.env.OWNER_DISCORD_IDS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

function checkIsOwner(user, account) {
  const email = (user?.email || "").toLowerCase();
  const byEmail = email && ownerEmails.includes(email);
  const discordId = account?.provider === "discord" ? account.providerAccountId : null;
  const byDiscord = discordId && ownerDiscordIds.includes(discordId);
  return !!(byEmail || byDiscord);
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
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email,
          image: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (checkIsOwner(user, account)) {
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
    async signIn({ user, account }) {
      // After sign-in completes and the user exists in DB, mark owner in DB without failing the flow
      try {
        if (checkIsOwner(user, account)) {
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

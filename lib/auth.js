import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

function getSiteUrl() {
  const explicit =
    process.env.NEXTAUTH_EMAIL_SITE ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  return explicit || "http://localhost:3000";
}

function renderVerificationEmail({ url, email, siteUrl }) {
  const safeUrl = url.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const iconUrl = `${siteUrl.replace(/\/$/, "")}/icon.svg`;
  return {
    subject: "Verify your OptiPlay account",
    text: `Verify your OptiPlay account\n${safeUrl}\n\nButton not working? Copy and paste the link above into your browser.`,
    html: `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify your account</title>
  </head>
  <body style="margin:0;background:#08060f;color:#e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#0f0b1c;border-radius:20px;border:1px solid rgba(255,255,255,0.06);padding:40px 32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${iconUrl}" alt="OptiPlay" width="88" height="88" style="display:block;border-radius:24px;box-shadow:0 12px 30px rgba(126,58,242,0.45);" />
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size:32px;font-weight:700;color:#f1f5f9;padding-bottom:16px;">Verify your account</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:24px;color:#cbd5f5;padding-bottom:28px;">
                Hello${email ? ` ${email}` : ""},<br /><br />
                Thanks for signing up for OptiPlay. Click the button below to confirm your account and jump back in.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:32px;">
                <a href="${safeUrl}" style="display:inline-block;background:#7c3aed;color:#f8fafc;font-weight:600;font-size:16px;padding:14px 28px;border-radius:14px;text-decoration:none;">Verify My Account</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:20px;color:#94a3b8;padding-top:12px;">
                If the button doesn’t work, copy and paste this link into your browser:<br />
                <span style="color:#cbd5f5;word-break:break-all;">${safeUrl}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

function sanitizeImageForToken(image) {
  if (!image) return null;
  if (image.startsWith("data:")) return null;
  if (image.length > 2048) return null;
  return image;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  providers: [
    EmailProvider({
      from: process.env.AUTH_EMAIL_FROM,
      server: process.env.AUTH_EMAIL_SERVER,
      maxAge: 60 * 60 * 3,
      async sendVerificationRequest({ identifier, url, provider }) {
        const targetOrigin = new URL(getSiteUrl());
        const magicUrl = new URL(url);
        magicUrl.protocol = targetOrigin.protocol;
        magicUrl.host = targetOrigin.host;
        const finalUrl = magicUrl.toString();

        const transport = nodemailer.createTransport(provider.server);
        const { subject, html, text } = renderVerificationEmail({
          url: finalUrl,
          email: identifier,
          siteUrl: targetOrigin.origin,
        });
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject,
          text,
          html,
        });
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email delivery failed to: ${failed.join(", ")}`);
        }
      },
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            isOwner: true,
            isMuted: true,
            muteExpiresAt: true,
          },
        });
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          throw new Error("Invalid email or password.");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: sanitizeImageForToken(user.image),
          isOwner: user.isOwner,
          isMuted: user.isMuted,
          muteExpiresAt: user.muteExpiresAt ? user.muteExpiresAt.toISOString() : null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id || token?.id;
      if (!userId) return token;

      if (user) {
        token.id = user.id;
        token.name = user.name || token.name;
        const sanitized = sanitizeImageForToken(user.image);
        token.image = sanitized;
        token.picture = sanitized;
        token.email = user.email || token.email;
        if (typeof user.isOwner === "boolean") token.isOwner = user.isOwner;
        if (typeof user.isMuted === "boolean") token.isMuted = user.isMuted;
        if (user.muteExpiresAt) {
          const expires = new Date(user.muteExpiresAt);
          token.muteExpiresAt = Number.isNaN(expires.getTime()) ? null : expires.toISOString();
        }
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            bio: true,
            image: true,
            isOwner: true,
            isMuted: true,
            muteExpiresAt: true,
            email: true,
          },
        });

        if (dbUser) {
          const now = new Date();
          if (dbUser.isMuted && dbUser.muteExpiresAt && dbUser.muteExpiresAt <= now) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  isMuted: false,
                  mutedAt: null,
                  mutedReason: null,
                  mutedByEmail: null,
                  muteExpiresAt: null,
                },
              }),
              prisma.userMuteAudit.create({
                data: {
                  userId: dbUser.id,
                  action: "auto_unmute",
                  reason: "Mute expired automatically.",
                },
              }),
            ]);
            dbUser.isMuted = false;
            dbUser.muteExpiresAt = null;
          }

          token.id = dbUser.id;
          token.name = dbUser.name || token.name;
          const sanitized = sanitizeImageForToken(dbUser.image);
          token.image = sanitized;
          token.picture = sanitized;
          token.email = dbUser.email || token.email;
          token.isOwner = dbUser.isOwner ?? token.isOwner ?? false;
          token.isMuted = dbUser.isMuted ?? false;
          token.muteExpiresAt = dbUser.muteExpiresAt ? dbUser.muteExpiresAt.toISOString() : null;
        }
      } catch {
        /* ignore */
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name || session.user.name || "";
        session.user.username = token.name || "";
        session.user.image = token.image || null;
        session.user.isOwner = !!token.isOwner;
        session.user.isMuted = !!token.isMuted;
        session.user.muteExpiresAt = token.muteExpiresAt || null;
        session.user.email = token.email || session.user.email || "";
        session.user.bio = "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const { GET, POST } = handlers;

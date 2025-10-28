import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import prisma from "./prisma";
import { shouldAllowEmail } from "./emailPolicy";

// parse env lists
const ownerEmails = (process.env.OWNER_EMAILS || "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

function checkIsOwner(user) {
  const email = (user?.email || "").toLowerCase();
  const byEmail = email && ownerEmails.includes(email);
  return !!byEmail;
}

const providers = [];

const MAILERSEND_API_TOKEN = process.env.MAILERSEND_API_TOKEN || process.env.MAILERSEND_TOKEN;
const AUTH_EMAIL_FROM = process.env.AUTH_EMAIL_FROM;
const AUTH_EMAIL_SERVER = process.env.AUTH_EMAIL_SERVER;

if (AUTH_EMAIL_FROM && (MAILERSEND_API_TOKEN || AUTH_EMAIL_SERVER)) {
  const common = {
    from: AUTH_EMAIL_FROM,
    maxAge: 60 * 30,
  };

  // Prefer MailerSend HTTP API when token is provided
  if (MAILERSEND_API_TOKEN) {
    providers.push(
      Email({
        ...common,
        async sendVerificationRequest({ identifier, url, provider }) {
          if (!shouldAllowEmail(identifier)) {
            const err = new Error("EmailDomainNotAllowed");
            err.name = "EmailDomainNotAllowed";
            throw err;
          }
          const res = await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MAILERSEND_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: { email: provider.from },
              to: [{ email: identifier }],
              subject: "Your OptiPlay magic link",
              text: `Sign in to OptiPlay: ${url}\nThis link expires in 30 minutes.`,
              html: `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;background:#0a0a0a;padding:24px">
                <h2 style="margin:0 0 12px 0;color:#fff">Sign in to OptiPlay</h2>
                <p style="margin:0 0 16px 0;color:#d1d5db">Click the button below to finish signing in. This link expires in 30 minutes.</p>
                <p><a href="${url}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">Sign in</a></p>
                <p style="margin-top:20px;color:#9ca3af;font-size:12px">If you did not request this email, you can ignore it.</p>
              </body></html>`,
            }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            const err = new Error(`MailerSendError: ${res.status} ${text}`);
            err.name = "MailerSendError";
            throw err;
          }
        },
      })
    );
  } else {
    // Fallback to SMTP transport defined in AUTH_EMAIL_SERVER
    providers.push(
      Email({
        ...common,
        server: AUTH_EMAIL_SERVER,
      })
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Use JWT sessions so auth() works in Edge middleware without Prisma
  session: { strategy: "jwt" },
  // Helps when running behind Vercel/Proxies and on preview URLs
  trustHost: true,
  // Surface detailed errors while developing
  debug: process.env.NODE_ENV !== "production",
  // Custom pages to avoid opaque 500s and surface provider errors
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  // Email-only auth. Ensure SMTP env vars are set in local/Vercel.
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Enforce email policy (block disposable domains and non-consumer providers unless allowed)
      try {
        if (account?.provider === "email" && user?.email && !shouldAllowEmail(user.email)) {
          // Best-effort cleanup if a record was created by the adapter before this callback runs
          try {
            await prisma.user.delete({ where: { email: user.email } });
          } catch {}
          return false;
        }
      } catch {}
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

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = { matcher: ["/admin/:path*"] };

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token && !token.isOwner) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

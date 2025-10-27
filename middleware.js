import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const config = { matcher: ["/admin/:path*"] };

export async function middleware(req) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

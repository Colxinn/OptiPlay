export const runtime = 'nodejs';

import { nextAuthHandler } from "@/lib/auth";

export const GET = nextAuthHandler;
export const POST = nextAuthHandler;

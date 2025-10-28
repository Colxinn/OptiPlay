<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ log: ["query"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
=======
import { PrismaClient } from '@prisma/client';

let prisma;
if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;
>>>>>>> origin/main

export default prisma;

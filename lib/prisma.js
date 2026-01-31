import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Reduce logging in production to avoid performance issues
const logLevel = process.env.NODE_ENV === "production" ? ["error"] : ["query"];

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ 
    log: logLevel,
    errorFormat: "minimal"
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

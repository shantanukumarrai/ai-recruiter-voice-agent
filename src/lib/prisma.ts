import { PrismaClient } from "@prisma/client";

/**
 * Next.js hot-reloads modules in dev, which would otherwise create a new
 * PrismaClient (and new connection pool) on every file save. We cache it
 * on the global object to keep a single instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

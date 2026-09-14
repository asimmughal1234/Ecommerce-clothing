import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Reused across invocations in every environment. On serverless each warm
// container would otherwise open a new pool on every request.
export const prisma = global.__prisma ?? new PrismaClient();
global.__prisma = prisma;

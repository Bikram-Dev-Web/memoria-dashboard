// @/lib/db.ts

import { PrismaClient } from '@prisma/client';

// This prevents multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
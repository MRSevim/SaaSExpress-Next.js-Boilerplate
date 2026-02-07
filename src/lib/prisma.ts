import { PrismaClient, Prisma } from "@/../generated/prisma/client";
import { env } from "@/utils/env";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  prismaPg?: PrismaPg;
};

const adapter =
  globalForPrisma.prismaPg ||
  new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPg = adapter;
}

export default prisma;

export type { Prisma };

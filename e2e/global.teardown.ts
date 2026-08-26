import prisma from "@/lib/prisma";
import { clearE2eEmailFiles } from "@/utils/test-utils/playwright-utils";
import { test as teardown } from "@playwright/test";

teardown("teardown", async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tableNames = tables
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  if (tableNames.length > 0) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
    );
  }

  // Clean up any leftover stubbed e2e email files, just in case
  clearE2eEmailFiles();
});

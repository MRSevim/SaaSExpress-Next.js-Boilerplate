/*
  Warnings:

  - You are about to drop the column `issuer` on the `account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "account_issuer_accountId_uidx";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "issuer";

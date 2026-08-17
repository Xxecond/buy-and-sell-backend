/*
  Warnings:

  - You are about to drop the column `verificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "verificationExpires",
DROP COLUMN "verificationToken";

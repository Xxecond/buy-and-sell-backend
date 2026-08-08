/*
  Warnings:

  - Made the column `imageUrl` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatar` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "categoryId" DROP DEFAULT,
ALTER COLUMN "imageUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

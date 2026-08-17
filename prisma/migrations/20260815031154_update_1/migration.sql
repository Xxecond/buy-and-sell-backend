/*
  Warnings:

  - Added the required column `userId` to the `DeviceSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceSession" ADD COLUMN     "userId" INTEGER NOT NULL;

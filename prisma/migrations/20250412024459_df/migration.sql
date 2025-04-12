/*
  Warnings:

  - You are about to drop the column `acountLocked` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "acountLocked",
ADD COLUMN     "accountLocked" BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - Added the required column `expiresAt` to the `Sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valid` to the `Sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sessions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valid" BOOLEAN NOT NULL;

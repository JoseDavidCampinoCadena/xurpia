/*
  Warnings:

  - A unique constraint covering the columns `[userId,projectId,technology]` on the table `UserEvaluation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `UserEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "membershipExpiresAt" TIMESTAMP(3),
ADD COLUMN     "membershipType" "MembershipType" NOT NULL DEFAULT 'FREE';

-- Add projectId column as nullable first
ALTER TABLE "UserEvaluation" ADD COLUMN "projectId" INTEGER;

-- Update existing evaluations to use the first project of the user (or a default project)
UPDATE "UserEvaluation" 
SET "projectId" = (
  SELECT COALESCE(
    (SELECT p.id FROM "Project" p WHERE p."ownerId" = "UserEvaluation"."userId" LIMIT 1),
    (SELECT p.id FROM "Project" p LIMIT 1),
    1
  )
);

-- Make projectId NOT NULL after updating existing records
ALTER TABLE "UserEvaluation" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserEvaluation_userId_projectId_technology_key" ON "UserEvaluation"("userId", "projectId", "technology");

-- AddForeignKey
ALTER TABLE "UserEvaluation" ADD CONSTRAINT "UserEvaluation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

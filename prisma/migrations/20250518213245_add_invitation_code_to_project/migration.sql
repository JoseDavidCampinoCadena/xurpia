/*
  Warnings:

  - A unique constraint covering the columns `[invitationCode]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "invitationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_invitationCode_key" ON "Project"("invitationCode");

-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

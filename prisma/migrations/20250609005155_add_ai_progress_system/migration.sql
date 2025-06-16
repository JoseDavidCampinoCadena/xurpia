-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "aiSuggestions" TEXT,
ADD COLUMN     "aiTimeline" TEXT,
ADD COLUMN     "completedAiTasks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedDuration" TEXT,
ADD COLUMN     "totalAiTasks" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AITask" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "skillLevel" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL DEFAULT 8,
    "dayNumber" INTEGER NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "projectId" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AITask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AITask" ADD CONSTRAINT "AITask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITask" ADD CONSTRAINT "AITask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

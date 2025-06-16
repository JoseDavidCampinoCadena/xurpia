/*
  Warnings:

  - Added the required column `feedback` to the `UserEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add feedback column with default value first
ALTER TABLE "UserEvaluation" ADD COLUMN "feedback" TEXT NOT NULL DEFAULT 'Evaluación completada';

-- Update existing records with appropriate feedback based on their level
UPDATE "UserEvaluation" 
SET "feedback" = CASE 
  WHEN "level" = 'ADVANCED' THEN 'Excelente conocimiento. Dominas conceptos avanzados y mejores prácticas.'
  WHEN "level" = 'INTERMEDIATE' THEN 'Buen conocimiento. Tienes una base sólida con algunos conceptos avanzados.'
  WHEN "level" = 'BEGINNER' THEN 'Conocimiento básico. Continúa aprendiendo los fundamentos.'
  ELSE 'Evaluación completada'
END;

-- Remove the default value constraint
ALTER TABLE "UserEvaluation" ALTER COLUMN "feedback" DROP DEFAULT;

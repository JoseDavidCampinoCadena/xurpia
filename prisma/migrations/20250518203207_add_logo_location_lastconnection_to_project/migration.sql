/*
  Warnings:

  - Added the required column `logo` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "lastConnection" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo" TEXT;

-- Asigna un logo por defecto a proyectos existentes
UPDATE "Project" SET "logo" = 'https://via.placeholder.com/100' WHERE "logo" IS NULL;

-- Luego haz la columna obligatoria
ALTER TABLE "Project" ALTER COLUMN "logo" SET NOT NULL;

/*
  Warnings:

  - Added the required column `edgeCases` to the `prd` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemStatement` to the `prd` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prd" ADD COLUMN     "acceptanceCriteria" TEXT[],
ADD COLUMN     "edgeCases" TEXT NOT NULL,
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "implementationApproach" TEXT[],
ADD COLUMN     "nonGoals" TEXT[],
ADD COLUMN     "problemStatement" TEXT NOT NULL;

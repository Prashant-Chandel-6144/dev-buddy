/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "feature_request" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE INDEX "workspace_userId_idx" ON "workspace"("userId");

-- AlterTable
ALTER TABLE "pull_request" ADD COLUMN     "featureRequestId" TEXT;

-- CreateIndex
CREATE INDEX "feature_request_projectId_idx" ON "feature_request"("projectId");

-- CreateIndex
CREATE INDEX "message_featureRequestId_idx" ON "message"("featureRequestId");

-- CreateIndex
CREATE INDEX "project_workspaceId_idx" ON "project"("workspaceId");

-- CreateIndex
CREATE INDEX "pull_request_featureRequestId_idx" ON "pull_request"("featureRequestId");

-- CreateIndex
CREATE INDEX "task_featureRequestId_idx" ON "task"("featureRequestId");

-- AddForeignKey
ALTER TABLE "pull_request" ADD CONSTRAINT "pull_request_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

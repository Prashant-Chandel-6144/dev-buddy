-- AlterTable
ALTER TABLE "prd" ADD COLUMN     "successMetrics" TEXT[],
ADD COLUMN     "userStories" TEXT[];

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "aiCredits" INTEGER NOT NULL DEFAULT 50;

-- CreateTable
CREATE TABLE "release_history" (
    "id" TEXT NOT NULL,
    "featureRequestId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "commitSha" TEXT NOT NULL,
    "mergedBy" TEXT NOT NULL,
    "completionPercentage" INTEGER NOT NULL,
    "verificationResult" TEXT,
    "releaseNotes" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "release_history_featureRequestId_idx" ON "release_history"("featureRequestId");

-- AddForeignKey
ALTER TABLE "release_history" ADD CONSTRAINT "release_history_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "feature_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

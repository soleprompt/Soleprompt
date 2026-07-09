-- CreateEnum
CREATE TYPE "StudioProjectStatus" AS ENUM ('queued', 'researching', 'writing', 'storyboarding', 'generating_assets', 'creating_voice', 'rendering_video', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "StudioJobStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "StudioLogLevel" AS ENUM ('info', 'warn', 'error', 'debug');

-- CreateEnum
CREATE TYPE "StudioAssetType" AS ENUM ('image', 'video_clip', 'audio', 'graphic', 'b_roll', 'other');

-- CreateEnum
CREATE TYPE "StudioUploadStatus" AS ENUM ('pending', 'uploading', 'completed', 'failed');

-- CreateTable
CREATE TABLE "StudioProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "niche" TEXT,
    "videoType" TEXT NOT NULL,
    "tone" TEXT,
    "status" "StudioProjectStatus" NOT NULL DEFAULT 'queued',
    "currentStep" TEXT,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "estimatedCompletionAt" TIMESTAMP(3),
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "packageId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioProjectLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "level" "StudioLogLevel" NOT NULL DEFAULT 'info',
    "step" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioProjectLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "status" "StudioJobStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "payload" JSONB,
    "result" JSONB,
    "error" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,

    CONSTRAINT "StudioJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioScene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "script" TEXT,
    "durationSec" INTEGER,
    "visualNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT,
    "type" "StudioAssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "provider" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioVoiceover" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT,
    "text" TEXT NOT NULL,
    "audioUrl" TEXT,
    "provider" TEXT,
    "voiceId" TEXT,
    "durationSec" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioVoiceover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioVideo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "url" TEXT,
    "durationSec" INTEGER,
    "provider" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioThumbnail" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "provider" TEXT,
    "metadata" JSONB,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioThumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioUpload" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'youtube',
    "status" "StudioUploadStatus" NOT NULL DEFAULT 'pending',
    "externalId" TEXT,
    "externalUrl" TEXT,
    "error" TEXT,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioAnalytics" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "watchTimeSec" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION,
    "metadata" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioProject_packageId_key" ON "StudioProject"("packageId");

-- CreateIndex
CREATE INDEX "StudioProject_userId_createdAt_idx" ON "StudioProject"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioProject_status_createdAt_idx" ON "StudioProject"("status", "createdAt");

-- CreateIndex
CREATE INDEX "StudioProjectLog_projectId_createdAt_idx" ON "StudioProjectLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioJob_status_scheduledAt_idx" ON "StudioJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "StudioJob_projectId_step_idx" ON "StudioJob"("projectId", "step");

-- CreateIndex
CREATE INDEX "StudioScene_projectId_orderIndex_idx" ON "StudioScene"("projectId", "orderIndex");

-- CreateIndex
CREATE INDEX "StudioAsset_projectId_idx" ON "StudioAsset"("projectId");

-- CreateIndex
CREATE INDEX "StudioAsset_sceneId_idx" ON "StudioAsset"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioVoiceover_sceneId_key" ON "StudioVoiceover"("sceneId");

-- CreateIndex
CREATE INDEX "StudioVoiceover_projectId_idx" ON "StudioVoiceover"("projectId");

-- CreateIndex
CREATE INDEX "StudioVideo_projectId_idx" ON "StudioVideo"("projectId");

-- CreateIndex
CREATE INDEX "StudioThumbnail_projectId_idx" ON "StudioThumbnail"("projectId");

-- CreateIndex
CREATE INDEX "StudioUpload_projectId_idx" ON "StudioUpload"("projectId");

-- CreateIndex
CREATE INDEX "StudioAnalytics_projectId_fetchedAt_idx" ON "StudioAnalytics"("projectId", "fetchedAt");

-- AddForeignKey
ALTER TABLE "StudioProject" ADD CONSTRAINT "StudioProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioProject" ADD CONSTRAINT "StudioProject_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "YouTubePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioProjectLog" ADD CONSTRAINT "StudioProjectLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioJob" ADD CONSTRAINT "StudioJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioScene" ADD CONSTRAINT "StudioScene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAsset" ADD CONSTRAINT "StudioAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAsset" ADD CONSTRAINT "StudioAsset_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StudioScene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoiceover" ADD CONSTRAINT "StudioVoiceover_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVoiceover" ADD CONSTRAINT "StudioVoiceover_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "StudioScene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioVideo" ADD CONSTRAINT "StudioVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioThumbnail" ADD CONSTRAINT "StudioThumbnail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioUpload" ADD CONSTRAINT "StudioUpload_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAnalytics" ADD CONSTRAINT "StudioAnalytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

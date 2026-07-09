-- AlterEnum
ALTER TYPE "StudioProjectStatus" ADD VALUE 'storyboard_complete' AFTER 'storyboarding';

-- AlterTable
ALTER TABLE "StudioScene" ADD COLUMN "narration" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "onScreenText" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "visualDescription" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "cameraMovement" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "bRollRecommendation" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "aiImagePrompt" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "aiVideoPrompt" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "soundEffects" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "backgroundMusicMood" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "transitionType" TEXT;
ALTER TABLE "StudioScene" ADD COLUMN "captionText" TEXT;

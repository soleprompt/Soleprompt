-- CreateEnum
CREATE TYPE "PromptDifficulty" AS ENUM ('beginner', 'intermediate', 'advanced');

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN "difficulty" "PromptDifficulty" NOT NULL DEFAULT 'beginner';
ALTER TABLE "Prompt" ADD COLUMN "estimatedTimeSaved" TEXT;
ALTER TABLE "Prompt" ADD COLUMN "coverImageUrl" TEXT;

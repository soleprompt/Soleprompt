-- CreateTable
CREATE TABLE "ToolVisit" (
    "id" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "userId" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolVisit_toolSlug_visitedAt_idx" ON "ToolVisit"("toolSlug", "visitedAt");

-- AddForeignKey
ALTER TABLE "ToolVisit" ADD CONSTRAINT "ToolVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

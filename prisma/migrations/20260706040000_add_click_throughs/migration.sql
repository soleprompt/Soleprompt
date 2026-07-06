-- CreateTable
CREATE TABLE "ClickThrough" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickThrough_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickThrough_eventType_targetKey_clickedAt_idx" ON "ClickThrough"("eventType", "targetKey", "clickedAt");

-- AddForeignKey
ALTER TABLE "ClickThrough" ADD CONSTRAINT "ClickThrough_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

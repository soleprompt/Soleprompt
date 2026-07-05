-- CreateTable
CREATE TABLE "XConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "accessSecret" TEXT NOT NULL,
    "screenName" TEXT NOT NULL,
    "xUserId" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XConnection_connectedAt_idx" ON "XConnection"("connectedAt");

-- AddForeignKey
ALTER TABLE "XConnection" ADD CONSTRAINT "XConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

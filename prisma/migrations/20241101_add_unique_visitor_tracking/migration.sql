-- CreateTable
CREATE TABLE "UniqueVisitor" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UniqueVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UniqueVisitor_ipHash_key" ON "UniqueVisitor"("ipHash");

-- CreateIndex
CREATE INDEX "UniqueVisitor_lastSeen_idx" ON "UniqueVisitor"("lastSeen");

-- CreateIndex
CREATE INDEX "UniqueVisitor_firstSeen_idx" ON "UniqueVisitor"("firstSeen");

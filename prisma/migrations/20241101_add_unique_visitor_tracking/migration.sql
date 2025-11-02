-- CreateTable (only if not exists)
CREATE TABLE IF NOT EXISTS "UniqueVisitor" (
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

-- CreateIndex (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UniqueVisitor_ipHash_key') THEN
        CREATE UNIQUE INDEX "UniqueVisitor_ipHash_key" ON "UniqueVisitor"("ipHash");
    END IF;
END $$;

-- CreateIndex (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UniqueVisitor_lastSeen_idx') THEN
        CREATE INDEX "UniqueVisitor_lastSeen_idx" ON "UniqueVisitor"("lastSeen");
    END IF;
END $$;

-- CreateIndex (only if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'UniqueVisitor_firstSeen_idx') THEN
        CREATE INDEX "UniqueVisitor_firstSeen_idx" ON "UniqueVisitor"("firstSeen");
    END IF;
END $$;

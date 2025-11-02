CREATE TABLE IF NOT EXISTS "UserAccessLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "city" TEXT,
  "region" TEXT,
  "country" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserAccessLog_userId_ipAddress_key" ON "UserAccessLog"("userId", "ipAddress");
CREATE INDEX IF NOT EXISTS "UserAccessLog_ipAddress_idx" ON "UserAccessLog"("ipAddress");

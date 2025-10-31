ALTER TABLE "User"
  ADD COLUMN "muteExpiresAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "UserMuteAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "moderatorEmail" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserMuteAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserMuteAudit_userId_createdAt_idx" ON "UserMuteAudit"("userId", "createdAt");

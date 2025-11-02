-- Add PendingUser table for email verification
CREATE TABLE IF NOT EXISTS "PendingUser" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "verificationCode" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PendingUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PendingUser_email_key" ON "PendingUser"("email");
CREATE INDEX IF NOT EXISTS "PendingUser_email_idx" ON "PendingUser"("email");
CREATE INDEX IF NOT EXISTS "PendingUser_verificationCode_idx" ON "PendingUser"("verificationCode");

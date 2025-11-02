-- OG Badge System for Early Adopters (November 2-26, 2025)
-- Run this SQL directly on your database to add OG badge support

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "isOG" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ogGrantedAt" TIMESTAMP(3);

-- Optional: Grant OG status to existing users who signed up before November 26, 2025
-- UPDATE "User" 
-- SET "isOG" = true, "ogGrantedAt" = NOW() 
-- WHERE "createdAt" < '2025-11-26 23:59:59' AND "isOG" = false;

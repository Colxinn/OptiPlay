-- Add pinned flag to forum posts
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- Ensure usernames are unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_name_key" ON "User"("name") WHERE "name" IS NOT NULL;

-- Create profile comments table
CREATE TABLE IF NOT EXISTS "ProfileComment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProfileComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProfileComment_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProfileComment_targetId_createdAt_idx" ON "ProfileComment"("targetId", "createdAt");

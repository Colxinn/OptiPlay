-- Migration: Add ProConfigVote table for one-vote-per-user tracking
-- Run this migration after deploying the updated schema

-- Create ProConfigVote table
CREATE TABLE IF NOT EXISTS "ProConfigVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "vote" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "ProConfigVote_configId_fkey" FOREIGN KEY ("configId") 
        REFERENCES "ProConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint to prevent duplicate votes
CREATE UNIQUE INDEX "ProConfigVote_configId_userId_ipAddress_key" 
    ON "ProConfigVote"("configId", "userId", "ipAddress");

-- Create indexes for performance
CREATE INDEX "ProConfigVote_configId_idx" ON "ProConfigVote"("configId");
CREATE INDEX "ProConfigVote_ipAddress_idx" ON "ProConfigVote"("ipAddress");

-- Note: This table tracks individual votes to enforce one-vote-per-user
-- The ProConfig.votes field is still the aggregate count for performance

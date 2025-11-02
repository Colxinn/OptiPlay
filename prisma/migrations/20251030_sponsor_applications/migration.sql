-- CreateTable
CREATE TABLE "SponsorApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "platformStatus" TEXT NOT NULL DEFAULT 'yes',
    "platformDetails" TEXT,
    "postsLongVideos" BOOLEAN NOT NULL,
    "contentRelevant" BOOLEAN NOT NULL,
    "sponsorshipType" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "termsAgreed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorApplication_ipAddress_createdAt_idx" ON "SponsorApplication"("ipAddress", "createdAt");

-- AddForeignKey
ALTER TABLE "SponsorApplication" ADD CONSTRAINT "SponsorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

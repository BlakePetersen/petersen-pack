-- AlterTable
ALTER TABLE "ClientImage" ADD COLUMN     "isArtistPick" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ClientImage_isArtistPick_idx" ON "ClientImage"("isArtistPick");

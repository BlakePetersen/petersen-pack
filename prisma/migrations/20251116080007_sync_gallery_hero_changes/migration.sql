/*
  Warnings:

  - You are about to drop the column `shootType` on the `Gallery` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle` on the `HeroSlide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "shootType";

-- AlterTable
ALTER TABLE "HeroSlide" DROP COLUMN "category",
DROP COLUMN "subtitle",
ADD COLUMN     "galleryId" TEXT,
ADD COLUMN     "imageId" TEXT,
ALTER COLUMN "imageUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "HeroSlide_galleryId_idx" ON "HeroSlide"("galleryId");

-- CreateIndex
CREATE INDEX "HeroSlide_imageId_idx" ON "HeroSlide"("imageId");

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

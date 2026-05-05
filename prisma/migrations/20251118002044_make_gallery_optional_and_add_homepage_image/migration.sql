-- AlterTable
ALTER TABLE "HomepageContent" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "galleryId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "HomepageContent_imageId_idx" ON "HomepageContent"("imageId");

-- AddForeignKey
ALTER TABLE "HomepageContent" ADD CONSTRAINT "HomepageContent_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

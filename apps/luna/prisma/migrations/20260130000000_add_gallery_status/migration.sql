-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN "status" "GalleryStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Gallery" ADD COLUMN "publishedAt" TIMESTAMP(3);

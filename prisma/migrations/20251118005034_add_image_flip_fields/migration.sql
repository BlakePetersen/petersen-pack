-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "flipHorizontal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flipVertical" BOOLEAN NOT NULL DEFAULT false;

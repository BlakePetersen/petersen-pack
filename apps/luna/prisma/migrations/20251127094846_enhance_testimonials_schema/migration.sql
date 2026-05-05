-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "caseStudyUrl" TEXT,
ADD COLUMN     "clientPhoto" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "serviceType" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Testimonial_featured_idx" ON "Testimonial"("featured");

-- CreateIndex
CREATE INDEX "Testimonial_serviceType_idx" ON "Testimonial"("serviceType");

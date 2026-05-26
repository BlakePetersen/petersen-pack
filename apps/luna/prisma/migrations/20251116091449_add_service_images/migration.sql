-- CreateTable
CREATE TABLE "ServiceImage" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "focalX" DOUBLE PRECISION DEFAULT 0.5,
    "focalY" DOUBLE PRECISION DEFAULT 0.5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceImage_categoryId_idx" ON "ServiceImage"("categoryId");

-- CreateIndex
CREATE INDEX "ServiceImage_sortOrder_idx" ON "ServiceImage"("sortOrder");

-- AddForeignKey
ALTER TABLE "ServiceImage" ADD CONSTRAINT "ServiceImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PricingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

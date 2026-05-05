-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClientGalleryStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RetouchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ChangeRequestType" AS ENUM ('FAVORITES', 'RETOUCH', 'OTHER');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'FINAL_BALANCE', 'EXTRA_RETOUCHES', 'ADDITIONAL_DOWNLOADS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shootType" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coverImage" TEXT,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "focalX" DOUBLE PRECISION DEFAULT 0.5,
    "focalY" DOUBLE PRECISION DEFAULT 0.5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "galleryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "preferredContactMethod" TEXT DEFAULT 'EMAIL',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientGallery" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "status" "ClientGalleryStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "contractId" TEXT,
    "downloadQuotaUsed" INTEGER NOT NULL DEFAULT 0,
    "finalPaymentStatus" "PaymentStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "focalX" DOUBLE PRECISION DEFAULT 0.5,
    "focalY" DOUBLE PRECISION DEFAULT 0.5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "clientGalleryId" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "downloaded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetouchRequest" (
    "id" TEXT NOT NULL,
    "clientImageId" TEXT NOT NULL,
    "clientGalleryId" TEXT NOT NULL,
    "notes" TEXT,
    "status" "RetouchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetouchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPreference" (
    "id" TEXT NOT NULL,
    "clientGalleryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hideRetouchModal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "clientGalleryId" TEXT NOT NULL,
    "requestType" "ChangeRequestType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "mobileFocalX" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "mobileFocalY" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "availabilitySlotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceType" TEXT NOT NULL,
    "sessionDuration" INTEGER NOT NULL,
    "employeeCount" INTEGER,
    "message" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostCategory" (
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "BlogPostCategory_pkey" PRIMARY KEY ("postId","categoryId")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "BlogPostImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "focalX" DOUBLE PRECISION DEFAULT 0.5,
    "focalY" DOUBLE PRECISION DEFAULT 0.5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPackage" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "features" TEXT[],
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingAddOn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingAddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "inquiryId" TEXT,
    "bookingId" TEXT,
    "shootType" TEXT NOT NULL,
    "shootDate" TIMESTAMP(3) NOT NULL,
    "shootLocation" TEXT NOT NULL,
    "sessionDuration" TEXT NOT NULL,
    "deliverablesDescription" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "retouchesIncluded" INTEGER NOT NULL,
    "pricePerExtraRetouch" INTEGER NOT NULL,
    "downloadQuota" INTEGER NOT NULL,
    "maxFileSizePx" INTEGER NOT NULL,
    "signedAt" TIMESTAMP(3),
    "signatureType" TEXT,
    "signatureData" TEXT,
    "signatureIpAddress" TEXT,
    "signedPdfUrl" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRight" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractUsageRight" (
    "contractId" TEXT NOT NULL,
    "usageRightId" TEXT NOT NULL,

    CONSTRAINT "ContractUsageRight_pkey" PRIMARY KEY ("contractId","usageRightId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "clientGalleryId" TEXT,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "stripeReceiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Gallery_slug_key" ON "Gallery"("slug");

-- CreateIndex
CREATE INDEX "Image_galleryId_idx" ON "Image"("galleryId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientGallery_slug_key" ON "ClientGallery"("slug");

-- CreateIndex
CREATE INDEX "ClientGallery_clientId_idx" ON "ClientGallery"("clientId");

-- CreateIndex
CREATE INDEX "ClientGallery_status_idx" ON "ClientGallery"("status");

-- CreateIndex
CREATE INDEX "ClientGallery_contractId_idx" ON "ClientGallery"("contractId");

-- CreateIndex
CREATE INDEX "ClientImage_clientGalleryId_idx" ON "ClientImage"("clientGalleryId");

-- CreateIndex
CREATE INDEX "ClientImage_isFavorite_idx" ON "ClientImage"("isFavorite");

-- CreateIndex
CREATE INDEX "RetouchRequest_clientImageId_idx" ON "RetouchRequest"("clientImageId");

-- CreateIndex
CREATE INDEX "RetouchRequest_clientGalleryId_idx" ON "RetouchRequest"("clientGalleryId");

-- CreateIndex
CREATE INDEX "RetouchRequest_status_idx" ON "RetouchRequest"("status");

-- CreateIndex
CREATE INDEX "GalleryPreference_userId_idx" ON "GalleryPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPreference_clientGalleryId_userId_key" ON "GalleryPreference"("clientGalleryId", "userId");

-- CreateIndex
CREATE INDEX "ChangeRequest_clientGalleryId_idx" ON "ChangeRequest"("clientGalleryId");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_date_idx" ON "AvailabilitySlot"("date");

-- CreateIndex
CREATE INDEX "Booking_availabilitySlotId_idx" ON "Booking"("availabilitySlotId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_published_idx" ON "BlogPost"("published");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");

-- CreateIndex
CREATE INDEX "BlogPostCategory_postId_idx" ON "BlogPostCategory"("postId");

-- CreateIndex
CREATE INDEX "BlogPostCategory_categoryId_idx" ON "BlogPostCategory"("categoryId");

-- CreateIndex
CREATE INDEX "BlogPostTag_postId_idx" ON "BlogPostTag"("postId");

-- CreateIndex
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");

-- CreateIndex
CREATE INDEX "BlogPostImage_postId_idx" ON "BlogPostImage"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PricingCategory_slug_key" ON "PricingCategory"("slug");

-- CreateIndex
CREATE INDEX "PricingCategory_sortOrder_idx" ON "PricingCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "PricingPackage_categoryId_idx" ON "PricingPackage"("categoryId");

-- CreateIndex
CREATE INDEX "PricingPackage_sortOrder_idx" ON "PricingPackage"("sortOrder");

-- CreateIndex
CREATE INDEX "PricingAddOn_sortOrder_idx" ON "PricingAddOn"("sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_sortOrder_idx" ON "Testimonial"("sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_isActive_idx" ON "Testimonial"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageContent_section_key" ON "HomepageContent"("section");

-- CreateIndex
CREATE INDEX "HomepageContent_section_idx" ON "HomepageContent"("section");

-- CreateIndex
CREATE INDEX "Contract_clientId_idx" ON "Contract"("clientId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_deletedAt_idx" ON "Contract"("deletedAt");

-- CreateIndex
CREATE INDEX "Contract_shootDate_idx" ON "Contract"("shootDate");

-- CreateIndex
CREATE INDEX "Contract_expiresAt_idx" ON "Contract"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRight_name_key" ON "UsageRight"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRight_slug_key" ON "UsageRight"("slug");

-- CreateIndex
CREATE INDEX "UsageRight_sortOrder_idx" ON "UsageRight"("sortOrder");

-- CreateIndex
CREATE INDEX "UsageRight_isActive_idx" ON "UsageRight"("isActive");

-- CreateIndex
CREATE INDEX "ContractUsageRight_contractId_idx" ON "ContractUsageRight"("contractId");

-- CreateIndex
CREATE INDEX "ContractUsageRight_usageRightId_idx" ON "ContractUsageRight"("usageRightId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_contractId_idx" ON "Payment"("contractId");

-- CreateIndex
CREATE INDEX "Payment_clientGalleryId_idx" ON "Payment"("clientGalleryId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTemplate_section_key" ON "ContractTemplate"("section");

-- CreateIndex
CREATE INDEX "ContractTemplate_sortOrder_idx" ON "ContractTemplate"("sortOrder");

-- CreateIndex
CREATE INDEX "ContractTemplate_isActive_idx" ON "ContractTemplate"("isActive");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientGallery" ADD CONSTRAINT "ClientGallery_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientGallery" ADD CONSTRAINT "ClientGallery_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientImage" ADD CONSTRAINT "ClientImage_clientGalleryId_fkey" FOREIGN KEY ("clientGalleryId") REFERENCES "ClientGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetouchRequest" ADD CONSTRAINT "RetouchRequest_clientImageId_fkey" FOREIGN KEY ("clientImageId") REFERENCES "ClientImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_clientGalleryId_fkey" FOREIGN KEY ("clientGalleryId") REFERENCES "ClientGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_availabilitySlotId_fkey" FOREIGN KEY ("availabilitySlotId") REFERENCES "AvailabilitySlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCategory" ADD CONSTRAINT "BlogPostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostImage" ADD CONSTRAINT "BlogPostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPackage" ADD CONSTRAINT "PricingPackage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PricingCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractUsageRight" ADD CONSTRAINT "ContractUsageRight_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractUsageRight" ADD CONSTRAINT "ContractUsageRight_usageRightId_fkey" FOREIGN KEY ("usageRightId") REFERENCES "UsageRight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientGalleryId_fkey" FOREIGN KEY ("clientGalleryId") REFERENCES "ClientGallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `description` on table `PricingCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PricingCategory" ADD COLUMN     "serviceId" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "icon" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "customIconSvg" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProcessStep" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "processStepId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ServiceProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceInfoCard" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "infoCardId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ServiceInfoCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProcessStep_serviceId_processStepId_key" ON "ServiceProcessStep"("serviceId", "processStepId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceInfoCard_serviceId_infoCardId_key" ON "ServiceInfoCard"("serviceId", "infoCardId");

-- AddForeignKey
ALTER TABLE "PricingCategory" ADD CONSTRAINT "PricingCategory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoCard" ADD CONSTRAINT "InfoCard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProcessStep" ADD CONSTRAINT "ServiceProcessStep_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProcessStep" ADD CONSTRAINT "ServiceProcessStep_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceInfoCard" ADD CONSTRAINT "ServiceInfoCard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceInfoCard" ADD CONSTRAINT "ServiceInfoCard_infoCardId_fkey" FOREIGN KEY ("infoCardId") REFERENCES "InfoCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

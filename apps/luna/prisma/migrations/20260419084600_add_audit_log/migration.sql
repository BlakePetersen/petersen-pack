-- CreateEnum
CREATE TYPE "AuditResourceType" AS ENUM ('USER', 'CLIENT_GALLERY', 'GALLERY', 'CONTRACT', 'BOOKING', 'INQUIRY', 'PAYMENT', 'PREVIEW_TOKEN', 'FAQ', 'SERVICE');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" "AuditResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "ua" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_createdAt_idx" ON "AuditLog"("resourceType", "resourceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");


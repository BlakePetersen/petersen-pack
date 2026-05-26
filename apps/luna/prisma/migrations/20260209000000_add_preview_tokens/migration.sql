-- CreateTable
CREATE TABLE "PreviewToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PreviewToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreviewToken_token_key" ON "PreviewToken"("token");

-- CreateIndex
CREATE INDEX "PreviewToken_token_idx" ON "PreviewToken"("token");

-- CreateIndex
CREATE INDEX "PreviewToken_expiresAt_idx" ON "PreviewToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PreviewToken_resourceType_resourceId_idx" ON "PreviewToken"("resourceType", "resourceId");

-- AlterTable
ALTER TABLE "RetouchRequest" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" TEXT,
ADD COLUMN     "retouchedImageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "RetouchRequest" ADD CONSTRAINT "RetouchRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

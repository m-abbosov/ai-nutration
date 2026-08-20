-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminPermissionKey" ADD VALUE 'USERS_DELETE';
ALTER TYPE "AdminPermissionKey" ADD VALUE 'FEATURE_ACCESS_MANAGE';
ALTER TYPE "AdminPermissionKey" ADD VALUE 'FITNESS_READ';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'USER_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_FEATURE_GRANTED';
ALTER TYPE "AuditAction" ADD VALUE 'USER_FEATURE_REVOKED';

-- CreateTable
CREATE TABLE "user_feature_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedById" TEXT,

    CONSTRAINT "user_feature_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_feature_access_feature_idx" ON "user_feature_access"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "user_feature_access_userId_feature_key" ON "user_feature_access"("userId", "feature");

-- AddForeignKey
ALTER TABLE "user_feature_access" ADD CONSTRAINT "user_feature_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feature_access" ADD CONSTRAINT "user_feature_access_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

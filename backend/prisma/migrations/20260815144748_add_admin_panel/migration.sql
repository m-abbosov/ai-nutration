-- CreateEnum
CREATE TYPE "AdminRoleName" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AdminPermissionKey" AS ENUM ('DASHBOARD_READ', 'USERS_READ', 'USERS_UPDATE', 'USERS_DISABLE', 'NUTRITION_READ', 'AI_READ', 'AI_LOGS_READ', 'CONVERSATIONS_READ', 'ANALYTICS_READ', 'SYSTEM_READ', 'ADMIN_USERS_READ', 'ADMIN_USERS_MANAGE', 'SETTINGS_MANAGE', 'AUDIT_LOGS_READ');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ADMIN_LOGIN', 'ADMIN_LOGIN_DENIED', 'USER_VIEWED', 'USER_STATUS_CHANGED', 'ADMIN_ROLE_CHANGED', 'ADMIN_USER_STATUS_CHANGED', 'CONVERSATION_VIEWED', 'SETTING_CHANGED', 'FEATURE_FLAG_CHANGED');

-- CreateEnum
CREATE TYPE "AiEndpoint" AS ENUM ('CHAT', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "AiRequestStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "SystemLogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "adminRoleId" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL,
    "name" "AdminRoleName" NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "key" "AdminPermissionKey" NOT NULL,
    "description" TEXT,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ai_request_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" "AiEndpoint" NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "model" TEXT NOT NULL,
    "status" "AiRequestStatus" NOT NULL,
    "errorReason" TEXT,
    "responseTimeMs" INTEGER NOT NULL,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "severity" "SystemLogSeverity" NOT NULL,
    "service" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "requestId" TEXT,
    "statusCode" INTEGER,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "admin_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_key_key" ON "admin_permissions"("key");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_createdAt_idx" ON "audit_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ai_request_logs_createdAt_idx" ON "ai_request_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_request_logs_userId_createdAt_idx" ON "ai_request_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_request_logs_status_createdAt_idx" ON "ai_request_logs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ai_request_logs_endpoint_createdAt_idx" ON "ai_request_logs"("endpoint", "createdAt");

-- CreateIndex
CREATE INDEX "system_logs_severity_createdAt_idx" ON "system_logs"("severity", "createdAt");

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_request_logs" ADD CONSTRAINT "ai_request_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_adminRoleId_fkey" FOREIGN KEY ("adminRoleId") REFERENCES "admin_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "oidc_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "grantId" TEXT,
    "userCode" TEXT,
    "uid" TEXT,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oidc_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oidc_models_name_idx" ON "oidc_models"("name");

-- CreateIndex
CREATE INDEX "oidc_models_name_grantId_idx" ON "oidc_models"("name", "grantId");

-- CreateIndex
CREATE INDEX "oidc_models_name_userCode_idx" ON "oidc_models"("name", "userCode");

-- CreateIndex
CREATE INDEX "oidc_models_name_uid_idx" ON "oidc_models"("name", "uid");

-- CreateIndex
CREATE INDEX "oidc_models_expiresAt_idx" ON "oidc_models"("expiresAt");

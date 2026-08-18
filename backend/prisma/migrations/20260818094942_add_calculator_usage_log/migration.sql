-- CreateTable
CREATE TABLE "calculator_usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "calculatorId" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculator_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calculator_usage_logs_createdAt_idx" ON "calculator_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "calculator_usage_logs_calculatorId_createdAt_idx" ON "calculator_usage_logs"("calculatorId", "createdAt");

-- CreateIndex
CREATE INDEX "calculator_usage_logs_userId_createdAt_idx" ON "calculator_usage_logs"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "calculator_usage_logs" ADD CONSTRAINT "calculator_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

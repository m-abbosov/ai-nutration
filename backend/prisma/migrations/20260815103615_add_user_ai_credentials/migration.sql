-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'OPENAI', 'CLAUDE');

-- CreateEnum
CREATE TYPE "AiKeyStatus" AS ENUM ('OK', 'EXHAUSTED', 'INVALID');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiApiKeyEncrypted" TEXT,
ADD COLUMN     "aiApiKeyLast4" TEXT,
ADD COLUMN     "aiKeyStatus" "AiKeyStatus",
ADD COLUMN     "aiKeyStatusMessage" TEXT,
ADD COLUMN     "aiProvider" "AiProvider";

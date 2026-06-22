-- CreateEnum
CREATE TYPE "CollegeStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "status" "CollegeStatus" NOT NULL DEFAULT 'ACTIVE';

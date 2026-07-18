-- CreateEnum
CREATE TYPE "Manager" AS ENUM ('AKHMAD', 'SAFA', 'ASLAN');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "manager" "Manager";

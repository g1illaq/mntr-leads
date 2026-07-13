-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('RUB', 'USD');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'NO_CONTACT', 'CONTACTED', 'PARTIALLY_PAID', 'PAID', 'NEXT_COHORT', 'REJECTED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "product" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "dealNumber" TEXT,
    "getcourseUrl" TEXT,
    "offerDeadline" TIMESTAMP(3),
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

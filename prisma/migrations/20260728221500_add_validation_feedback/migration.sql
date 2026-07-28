-- CreateEnum
CREATE TYPE "ValidationOutcome" AS ENUM ('PENDING', 'ACCURATE', 'PARTIALLY_ACCURATE', 'INACCURATE');

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "validationNotes" TEXT,
ADD COLUMN     "validationOutcome" "ValidationOutcome" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Recommendation_validationOutcome_idx" ON "Recommendation"("validationOutcome");

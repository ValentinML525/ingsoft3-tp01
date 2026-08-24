-- DropIndex
DROP INDEX "Propiedad_ubicacionId_idx";

-- AlterTable
ALTER TABLE "Unidad" ADD COLUMN     "habilitada" BOOLEAN NOT NULL DEFAULT true;

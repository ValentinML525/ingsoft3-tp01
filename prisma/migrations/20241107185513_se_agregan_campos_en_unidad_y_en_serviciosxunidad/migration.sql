-- AlterEnum
ALTER TYPE "EstadoReserva" ADD VALUE 'SOLICITADA';

-- AlterTable
ALTER TABLE "Unidad" ADD COLUMN     "descripcion" TEXT;

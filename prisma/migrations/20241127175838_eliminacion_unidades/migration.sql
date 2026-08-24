-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_unidadId_fkey";

-- DropForeignKey
ALTER TABLE "ServiciosXUnidad" DROP CONSTRAINT "ServiciosXUnidad_unidadId_fkey";

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiciosXUnidad" ADD CONSTRAINT "ServiciosXUnidad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

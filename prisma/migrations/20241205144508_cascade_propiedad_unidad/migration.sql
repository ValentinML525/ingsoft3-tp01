-- DropForeignKey
ALTER TABLE "Unidad" DROP CONSTRAINT "Unidad_propiedadId_fkey";

-- AddForeignKey
ALTER TABLE "Unidad" ADD CONSTRAINT "Unidad_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

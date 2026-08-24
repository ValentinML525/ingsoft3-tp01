-- DropForeignKey
ALTER TABLE "Imagen" DROP CONSTRAINT "Imagen_unidadId_fkey";

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

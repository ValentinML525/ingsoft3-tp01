-- DropForeignKey
ALTER TABLE "Propiedad" DROP CONSTRAINT "Propiedad_ubicacionId_fkey";

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

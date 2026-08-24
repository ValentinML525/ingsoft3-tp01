/*
  Warnings:

  - You are about to drop the column `tipologiaId` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the `ServiciosXTipologia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tipologia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `slug` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefonoContacto` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacidad` to the `Unidad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propiedadId` to the `Unidad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Unidad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiciosXTipologia" DROP CONSTRAINT "ServiciosXTipologia_servicioId_fkey";

-- DropForeignKey
ALTER TABLE "ServiciosXTipologia" DROP CONSTRAINT "ServiciosXTipologia_tipologiaId_fkey";

-- DropForeignKey
ALTER TABLE "Tipologia" DROP CONSTRAINT "Tipologia_propiedadId_fkey";

-- DropForeignKey
ALTER TABLE "Unidad" DROP CONSTRAINT "Unidad_tipologiaId_fkey";

-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "telefonoContacto" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reserva" ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "Unidad" DROP COLUMN "tipologiaId",
ADD COLUMN     "capacidad" INTEGER NOT NULL,
ADD COLUMN     "imagenes" TEXT[],
ADD COLUMN     "precioPorNoche" DOUBLE PRECISION,
ADD COLUMN     "propiedadId" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- DropTable
DROP TABLE "ServiciosXTipologia";

-- DropTable
DROP TABLE "Tipologia";

-- CreateTable
CREATE TABLE "ServiciosXUnidad" (
    "unidadId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "ServiciosXUnidad_pkey" PRIMARY KEY ("unidadId","servicioId")
);

-- AddForeignKey
ALTER TABLE "Unidad" ADD CONSTRAINT "Unidad_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiciosXUnidad" ADD CONSTRAINT "ServiciosXUnidad_unidadId_fkey" FOREIGN KEY ("unidadId") REFERENCES "Unidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiciosXUnidad" ADD CONSTRAINT "ServiciosXUnidad_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

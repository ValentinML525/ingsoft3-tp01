/*
  Warnings:

  - You are about to drop the column `capacidad` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the column `imagenes` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the column `precioPorNoche` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the column `propiedadId` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the column `tipoUnidad` on the `Unidad` table. All the data in the column will be lost.
  - You are about to drop the `ServiciosXUnidad` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipologiaId` to the `Unidad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ServiciosXUnidad" DROP CONSTRAINT "ServiciosXUnidad_servicioId_fkey";

-- DropForeignKey
ALTER TABLE "ServiciosXUnidad" DROP CONSTRAINT "ServiciosXUnidad_unidadId_fkey";

-- DropForeignKey
ALTER TABLE "Unidad" DROP CONSTRAINT "Unidad_propiedadId_fkey";

-- AlterTable
ALTER TABLE "Unidad" DROP COLUMN "capacidad",
DROP COLUMN "imagenes",
DROP COLUMN "precioPorNoche",
DROP COLUMN "propiedadId",
DROP COLUMN "tipoUnidad",
ADD COLUMN     "tipologiaId" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "ServiciosXUnidad";

-- CreateTable
CREATE TABLE "Tipologia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precioPorNoche" DOUBLE PRECISION,
    "imagenes" TEXT[],
    "propiedadId" INTEGER NOT NULL,

    CONSTRAINT "Tipologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiciosXTipologia" (
    "tipologiaId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,

    CONSTRAINT "ServiciosXTipologia_pkey" PRIMARY KEY ("tipologiaId","servicioId")
);

-- AddForeignKey
ALTER TABLE "Tipologia" ADD CONSTRAINT "Tipologia_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unidad" ADD CONSTRAINT "Unidad_tipologiaId_fkey" FOREIGN KEY ("tipologiaId") REFERENCES "Tipologia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiciosXTipologia" ADD CONSTRAINT "ServiciosXTipologia_tipologiaId_fkey" FOREIGN KEY ("tipologiaId") REFERENCES "Tipologia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiciosXTipologia" ADD CONSTRAINT "ServiciosXTipologia_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

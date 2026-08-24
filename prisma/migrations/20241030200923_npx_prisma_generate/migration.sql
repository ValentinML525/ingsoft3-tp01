/*
  Warnings:

  - You are about to drop the column `numero` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Propiedad` table. All the data in the column will be lost.
  - You are about to drop the `Calle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ciudad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provincia` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tipoPropiedadId` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ubicacionId` to the `Propiedad` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calle" DROP CONSTRAINT "Calle_ciudadId_fkey";

-- DropForeignKey
ALTER TABLE "Ciudad" DROP CONSTRAINT "Ciudad_provinciaId_fkey";

-- DropForeignKey
ALTER TABLE "Propiedad" DROP CONSTRAINT "Propiedad_calleId_fkey";

-- DropForeignKey
ALTER TABLE "Provincia" DROP CONSTRAINT "Provincia_paisId_fkey";

-- AlterTable
ALTER TABLE "Propiedad" DROP COLUMN "numero",
DROP COLUMN "tipo",
ADD COLUMN     "tipoPropiedadId" INTEGER NOT NULL,
ADD COLUMN     "ubicacionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Calle";

-- DropTable
DROP TABLE "Ciudad";

-- DropTable
DROP TABLE "Pais";

-- DropTable
DROP TABLE "Provincia";

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" TEXT NOT NULL,
    "logintud" TEXT NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoPropiedad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "esUnidad" BOOLEAN NOT NULL,

    CONSTRAINT "TipoPropiedad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_tipoPropiedadId_fkey" FOREIGN KEY ("tipoPropiedadId") REFERENCES "TipoPropiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

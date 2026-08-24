/*
  Warnings:

  - Added the required column `ciudad` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `latitud` on the `Ubicacion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `longitud` on the `Ubicacion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ubicacion" ADD COLUMN     "ciudad" TEXT NOT NULL,
ADD COLUMN     "provincia" TEXT NOT NULL,
DROP COLUMN "latitud",
ADD COLUMN     "latitud" DOUBLE PRECISION NOT NULL,
DROP COLUMN "longitud",
ADD COLUMN     "longitud" DOUBLE PRECISION NOT NULL;

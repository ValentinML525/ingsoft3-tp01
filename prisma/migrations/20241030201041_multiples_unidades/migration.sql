/*
  Warnings:

  - You are about to drop the column `esUnidad` on the `TipoPropiedad` table. All the data in the column will be lost.
  - Added the required column `contieneMultiplesUnidades` to the `TipoPropiedad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TipoPropiedad" DROP COLUMN "esUnidad",
ADD COLUMN     "contieneMultiplesUnidades" BOOLEAN NOT NULL;

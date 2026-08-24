/*
  Warnings:

  - You are about to drop the column `logintud` on the `Ubicacion` table. All the data in the column will be lost.
  - Added the required column `longitud` to the `Ubicacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ubicacion" DROP COLUMN "logintud",
ADD COLUMN     "longitud" TEXT NOT NULL;

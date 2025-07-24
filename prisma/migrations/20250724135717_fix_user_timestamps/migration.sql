/*
  Warnings:

  - Added the required column `quemRecebeuId` to the `Proposta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposta" ADD COLUMN     "quemRecebeuId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "nome" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_quemRecebeuId_fkey" FOREIGN KEY ("quemRecebeuId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

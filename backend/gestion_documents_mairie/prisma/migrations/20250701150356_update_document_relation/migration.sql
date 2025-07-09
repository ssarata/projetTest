-- DropForeignKey
ALTER TABLE "DocumentPersonne" DROP CONSTRAINT "DocumentPersonne_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPersonne" DROP CONSTRAINT "DocumentPersonne_personneId_fkey";

-- AlterTable
ALTER TABLE "DocumentPersonne" ALTER COLUMN "documentId" DROP NOT NULL,
ALTER COLUMN "personneId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentPersonne" ADD CONSTRAINT "DocumentPersonne_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPersonne" ADD CONSTRAINT "DocumentPersonne_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "Personne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

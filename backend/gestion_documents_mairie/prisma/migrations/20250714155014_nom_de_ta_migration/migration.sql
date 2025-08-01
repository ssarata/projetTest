-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RESPONSABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mairieId" INTEGER,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'RESPONSABLE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personne" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "profession" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "dateNaissance" TEXT,
    "nationalite" TEXT,
    "numeroCni" TEXT,
    "sexe" TEXT,
    "lieuNaissance" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "dateArchivage" TIMESTAMP(3),
    "archiveParId" INTEGER,

    CONSTRAINT "Personne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" SERIAL NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "dateArchivage" TIMESTAMP(3),
    "archiveParId" INTEGER,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variable" (
    "id" SERIAL NOT NULL,
    "nomVariable" TEXT NOT NULL,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "templateId" INTEGER,
    "userId" INTEGER NOT NULL,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "dateArchivage" TIMESTAMP(3),
    "archiveParId" INTEGER,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPersonne" (
    "id" SERIAL NOT NULL,
    "fonction" TEXT NOT NULL,
    "documentId" INTEGER,
    "personneId" INTEGER,

    CONSTRAINT "DocumentPersonne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mairie" (
    "id" SERIAL NOT NULL,
    "ville" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "nomMaire" TEXT NOT NULL,
    "prenomMaire" TEXT NOT NULL,

    CONSTRAINT "Mairie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentTemplateToVariable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DocumentTemplateToVariable_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DocumentToPersonne" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DocumentToPersonne_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_typeDocument_key" ON "DocumentTemplate"("typeDocument");

-- CreateIndex
CREATE UNIQUE INDEX "Variable_nomVariable_key" ON "Variable"("nomVariable");

-- CreateIndex
CREATE INDEX "_DocumentTemplateToVariable_B_index" ON "_DocumentTemplateToVariable"("B");

-- CreateIndex
CREATE INDEX "_DocumentToPersonne_B_index" ON "_DocumentToPersonne"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Personne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mairieId_fkey" FOREIGN KEY ("mairieId") REFERENCES "Mairie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personne" ADD CONSTRAINT "Personne_archiveParId_fkey" FOREIGN KEY ("archiveParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_archiveParId_fkey" FOREIGN KEY ("archiveParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_archiveParId_fkey" FOREIGN KEY ("archiveParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPersonne" ADD CONSTRAINT "DocumentPersonne_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPersonne" ADD CONSTRAINT "DocumentPersonne_personneId_fkey" FOREIGN KEY ("personneId") REFERENCES "Personne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTemplateToVariable" ADD CONSTRAINT "_DocumentTemplateToVariable_A_fkey" FOREIGN KEY ("A") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentTemplateToVariable" ADD CONSTRAINT "_DocumentTemplateToVariable_B_fkey" FOREIGN KEY ("B") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToPersonne" ADD CONSTRAINT "_DocumentToPersonne_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToPersonne" ADD CONSTRAINT "_DocumentToPersonne_B_fkey" FOREIGN KEY ("B") REFERENCES "Personne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

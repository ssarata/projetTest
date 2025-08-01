import { PrismaClient, Document } from '@prisma/client';

const prisma = new PrismaClient();

export default class DocumentService {

  // Add a new document
  async addDocument(data: Document & { personnes?: number[] }): Promise<Document> {
    try {
      return await prisma.document.create({
        data: {
          templateId: data.templateId,
          date: data.date,
          userId: data.userId,
          personnes: data.personnes && data.personnes.length > 0
            ? {
                connect: data.personnes.map((id: number) => ({ id })),
              }
            : undefined,
        },
      });
    } catch (error: any) {
      throw new Error("Error creating document: " + error.message);
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    try {
      return await prisma.document.findMany({
        where: { archive: false }, // Ne pas afficher les documents archivés
        include: {
          template: true,
          personnes: true,
          user:{
            include:{personne: true}
          },
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching documents: " + error.message);
    }
  }


  // Find a document by ID
  async getDocumentById(id: number): Promise<Document | null> {
    try {
      return await prisma.document.findUnique({
        where: { id },
        include: {
          template: true,
          personnes: true,
          user: true,
        },
      });
    } catch (error: any) {
      console.log(error);
      
      throw new Error("Error fetching document by ID: " + error.message);
    }
  }

  // Update a document by ID
  async updateDocument(id: number, updatedData: Partial<Document>): Promise<Document> {
    try {
      return await prisma.document.update({
        where: { id },
        data: updatedData,
      });
    } catch (error: any) {
      throw new Error("Error updating document: " + error.message);
    }
  }

  // Archive au lieu de supprimer
async deleteDocument(id: number, archiveParId: number): Promise<Document> {
  try {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new Error("Document non trouvé");
    }

    if (document.archive) {
      throw new Error("Le document est déjà archivé.");
    }

    return await prisma.document.update({
      where: { id },
      data: {
        archive: true,
        dateArchivage: new Date(),
        archiveParId,
      },
    });
  } catch (error: any) {
    throw new Error(`Erreur lors de l'archivage du document : ${error.message}`);
  }
}


  // Archive a document by ID
  async archiverDocument(id: number, archiveParId: number): Promise<Document> {
    try {
      return await prisma.document.update({
        where: { id },
        data: {
          archive: true,
          dateArchivage: new Date(),
          archiveParId: archiveParId,
        },
      });
    } catch (error: any) {
      throw new Error("Erreur lors de l'archivage du document : " + error.message);
    }
  }

// Désarchive un document par ID
async desarchiverDocument(id: number): Promise<Document> {
  try {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new Error("Document non trouvé");
    }

    return await prisma.document.update({
      where: { id },
      data: {
        archive: false,
        archiveParId: null,
      },
    });
  } catch (error: any) {
    throw new Error("Erreur lors du désarchivage du document : \n" + error.message);
  }
}

  // Supprimer définitivement un document par ID
  async deleteDocumentDefinitivement(id: number): Promise<{ message: string }> {

    try {
      const document = await prisma.document.findUnique({ where: { id } });
      if (!document) {
        throw new Error("Document non trouvé");
      }

      await prisma.document.delete({
        where: { id },
      });

      return { message: "Document supprimé définitivement avec succès." };
    } catch (error: any) {
      console.log(error);
      
      throw new Error("Erreur lors de la suppression définitive : " + error.message);
    }
  }

  // Récupérer tous les documents archivés
 // Récupérer tous les documents archivés
 async getAllDocumentsArchives(): Promise<Document[]> {
  return await prisma.document.findMany({
    where: { archive: true },
    include: {
      template: true,
      personnes: true,
      user: {
        include: { personne: true }, // ✅ Inclure la personne qui a créé
      },
      archivePar: {
        include: { personne: true }, // ✅ Inclure la personne qui a archivé
      },
    },
    orderBy: { dateArchivage: 'desc' },
  });
 }



}


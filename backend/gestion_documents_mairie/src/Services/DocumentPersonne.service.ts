import { PrismaClient, DocumentPersonne } from '@prisma/client';

const prisma = new PrismaClient();

export default class DocumentPersonneService {
  // Créer une nouvelle entrée DocumentPersonne
  async createDocumentPersonne(data: Omit<DocumentPersonne, 'id'>): Promise<DocumentPersonne> {
    try {
      return await prisma.documentPersonne.create({ data });
    } catch (error: any) {
      throw new Error("Error creating DocumentPersonne: " + error.message);
    }
  }

  // Récupérer toutes les entrées DocumentPersonne
  async getAllDocumentPersonnes(): Promise<DocumentPersonne[]> {
    try {
      return await prisma.documentPersonne.findMany({
        include: {
          document: true, // Inclure les informations du document
          personne: true, // Inclure les informations de la personne
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching DocumentPersonnes: " + error.message);
    }
  }

  // Récupérer une entrée DocumentPersonne par ID
  async getDocumentPersonneById(id: number): Promise<DocumentPersonne | null> {
    try {
      return await prisma.documentPersonne.findUnique({
        where: { id },
        include: {
          document: true, // Inclure les informations du document
          personne: true, // Inclure les informations de la personne
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching DocumentPersonne by ID: " + error.message);
    }
  }

  // Mettre à jour une entrée DocumentPersonne
  async updateDocumentPersonne(
    id: number,
    data: Partial<Omit<DocumentPersonne, 'id'>>
  ): Promise<DocumentPersonne> {
    try {
      return await prisma.documentPersonne.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      throw new Error("Error updating DocumentPersonne: " + error.message);
    }
  }

  // Supprimer une entrée DocumentPersonne
  async deleteDocumentPersonne(id: number): Promise<boolean> {
    try {
      await prisma.documentPersonne.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      throw new Error("Error deleting DocumentPersonne: " + error.message);
    }
  }

  // Récupérer toutes les personnes/fonctions liées à un document donné
  async documentPersonnesByDocumentId(documentId: number): Promise<DocumentPersonne[]> {
    try {
      return await prisma.documentPersonne.findMany({
        where: { documentId },
        include: {
          document: { include: { template: true } }, // Inclure document + template
          personne: true,
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching DocumentPersonnes by documentId: " + error.message);
    }
  }
}
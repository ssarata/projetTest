import { PrismaClient, DocumentTemplate } from '@prisma/client';

const prisma = new PrismaClient();

export default class DocumentTemplateService {
  // Créer un nouveau template
  async createTemplate(data: { content: string; typeDocument: string }): Promise<DocumentTemplate> {
    try {
      // Vérification des champs obligatoires
      if (!data.content || !data.typeDocument) {
        throw new Error('Les champs "content" et "typeDocument" sont obligatoires.');
      }

      return await prisma.documentTemplate.create({ data });
    } catch (error: any) {
      throw new Error(`Error creating template: ${error.message}`);
    }
  }

  // Récupérer tous les templates
  async getAllTemplates(): Promise<DocumentTemplate[]> {
    try {
      return await prisma.documentTemplate.findMany();
    } catch (error: any) {
      throw new Error(`Error fetching templates: ${error.message}`);
    }
  }

  // Récupérer un template par ID
  async getTemplateByType(typeDocument: string): Promise<DocumentTemplate | null> {
    try {
      return await prisma.documentTemplate.findUnique({ where: { typeDocument } });
    } catch (error: any) {
      throw new Error(`Error fetching template by typeDocument: ${error.message}`);
    }
  }
  async getTemplateById(id: number): Promise<DocumentTemplate | null> {
    try {
      return await prisma.documentTemplate.findUnique({ where: { id } ,include: { documents: true },});
    } catch (error: any) {
      throw new Error(`Error fetching template by id: ${error.message}`);
    }
  }

  // Mettre à jour un template
  async updateTemplate(
    id: number,
    data: Partial<DocumentTemplate>
  ): Promise<DocumentTemplate | null> {
    try {
      return await prisma.documentTemplate.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      throw new Error(`Error updating template: ${error.message}`);
    }
  }

  // 🟡 Archiver un template
    async archiverTemplate(id: number, userId: number): Promise<DocumentTemplate> {
      try {
        const template = await prisma.documentTemplate.findUnique({ where: { id } });

        if (!template) {
          throw new Error('DocumentTemplate introuvable');
        }

        if (template.archive) {
          throw new Error('Ce template est déjà archivé.');
        }

        return await prisma.documentTemplate.update({
          where: { id },
          data: {
            archive: true,
            dateArchivage: new Date(),
            archiveParId: userId,
          },
        });
      } catch (error: any) {
        throw new Error(`Erreur lors de l'archivage : ${error.message}`);
      }
    }

  // 🟢 Restaurer un template archivé
  async restaurerTemplate(id: number, userId: number): Promise<DocumentTemplate> {
    try {
      const template = await prisma.documentTemplate.findUnique({ where: { id } });

      if (!template) {
        throw new Error('DocumentTemplate introuvable');
      }

      if (!template.archive) {
        throw new Error('Ce template n’est pas archivé.');
      }

      return await prisma.documentTemplate.update({
        where: { id },
        data: {
          archive: false,
          dateArchivage: new Date(),
          archiveParId: userId
        },
      });
    } catch (error: any) {
      throw new Error(`Erreur lors de la restauration : ${error.message}`);
    }
  }

async getTemplatesArchives(): Promise<DocumentTemplate[]> {
  try {
    return await prisma.documentTemplate.findMany({
      where: { archive: true },
      orderBy: { dateArchivage: 'desc' },
      include: {
        archivePar: {
          include: {
            personne: true, // 🔁 Inclut la personne liée à l'utilisateur archiveur
          },
        },
      },
    })
  } catch (error: any) {
    throw new Error(`Erreur lors de la récupération des archives : ${error.message}`)
  }
}


    // Supprimer définitivement de la base 
  async deleteDefinitivementTemplate(id: number): Promise<DocumentTemplate> {
    try {
      return await prisma.documentTemplate.delete({ where: { id } });
    } catch (error: any) {
      throw new Error(`Erreur lors de la suppression définitive : ${error.message}`);
    }
  }
















}
import { PrismaClient, Variable } from '@prisma/client';

const prisma = new PrismaClient();

export default class VariableService {
  // Ajouter une nouvelle variable
  async createVariable(data: Omit<Variable, 'id'>): Promise<Variable> {
    try {
      // Vérifie l'unicité du nom de la variable
      const exist = await prisma.variable.findUnique({
        where: {
          nomVariable: data.nomVariable,
        },
      });

      if (exist) {
        throw new Error('Le nom de la variable existe déjà.');
      }

      // Si unique, on crée la variable
      return await prisma.variable.create({
        data,
      });
    } catch (error: any) {
      throw new Error(`Erreur lors de la création de la variable : ${error.message}`);
    }
  }

  // Récupérer toutes les variables
  async getAllVariables(): Promise<Variable[]> {
    try {
      return await prisma.variable.findMany();
    } catch (error: any) {
      throw new Error(`Erreur lors de la récupération des variables : ${error.message}`);
    }
  }

  // Récupérer une variable par son ID
  async getVariableById(id: number): Promise<Variable | null> {
    try {
      return await prisma.variable.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(`Erreur lors de la récupération de la variable : ${error.message}`);
    }
  }

  // Modifier une variable
  async updateVariable(id: number, dataVariable: Partial<Omit<Variable, 'id'>>): Promise<Variable> {
    try {
      return await prisma.variable.update({
        where: { id },
        data: dataVariable,
      });
    } catch (error: any) {
      throw new Error(`Erreur lors de la mise à jour de la variable : ${error.message}`);
    }
  }

  // Supprimer une variable
  async deleteVariable(id: number): Promise<boolean> {
    try {
      await prisma.variable.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      throw new Error(`Erreur lors de la suppression de la variable : ${error.message}`);
    }
  }

  // Récupérer les variables liées à un template
  async getVariablesByTemplate(templateId: number): Promise<Variable[]> {
    try {
      return await prisma.variable.findMany({
        where: {
          documentTemplateVariables: {
            some: {
              documentTemplateId: templateId,
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error(
        `Erreur lors de la récupération des variables liées au template : ${error.message}`
      );
    }
  }
}
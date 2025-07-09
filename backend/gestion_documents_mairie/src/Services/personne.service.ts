import { PrismaClient, Personne, Prisma } from '@prisma/client';
import PersonneValidate from '../Validations/PersonneValidate';

const prisma = new PrismaClient();

const createPersonne = async (data: Prisma.PersonneCreateInput): Promise<Personne> => {
  try {
    const validatedData = PersonneValidate(data) as Prisma.PersonneCreateInput;
    return await prisma.personne.create({
      data: validatedData,
      include: {
        user: true,
        
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la création de la personne : " + error.message);
  }
};

const getAllPersonnes = async (): Promise<Personne[]> => {
  try {
    return await prisma.personne.findMany({
      include: {
        user: true,
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la récupération des personnes : " + error.message);
  }
};

const getPersonneById = async (id: number): Promise<Personne | null> => {
  try {
    return await prisma.personne.findUnique({
      where: { id },
      include: {
        user: true,
        documentPersonnes: {
          include: { document:{ include: { template: true } } }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la récupération de la personne par ID : " + error.message);
  }
};

const updatePersonne = async (id: number, data: Partial<Personne>): Promise<Personne> => {
  try {
    const existingPersonne = await prisma.personne.findUnique({ where: { id } });
    if (!existingPersonne) {
      throw new Error(`La personne avec l'id ${id} n'existe pas.`);
    }

    const validatedData = PersonneValidate(data);

    // Filtrer uniquement les champs scalaires à mettre à jour
    const {
      nom,
      prenom,
      profession,
      adresse,
      telephone,
      dateNaissance,
      nationalite,
      numeroCni,
      sexe,
      lieuNaissance
    } = validatedData;

    return await prisma.personne.update({
      where: { id },
      data: {
        nom,
        prenom,
        profession,
        adresse,
        telephone,
        dateNaissance,
        nationalite,
        numeroCni,
        sexe,
        lieuNaissance
      },
      include: {
        user: true,
        documentPersonnes: {
          include: { document: true }
        }
      }
    });

  } catch (error: any) {
    throw new Error("Erreur lors de la mise à jour de la personne : " + error.message);
  }
};


const deletePersonne = async (id: number): Promise<void> => {
  try {
    const personne = await prisma.personne.findUnique({
      where: { id },
      include: {
        documentPersonnes: true,
        user: true
      }
    });

    if (!personne) {
      throw new Error(`La personne avec l'id ${id} n'existe pas.`);
    }

    if (personne.documentPersonnes.length > 0) {
      await prisma.documentPersonne.deleteMany({
        where: { personneId: id }
      });
    }

    if (personne.user) {
      await prisma.user.delete({
        where: { id: personne.user.id }
      });
    }

    await prisma.personne.delete({
      where: { id }
    });

  } catch (error: any) {
    throw new Error("Erreur lors de la suppression de la personne : " + error.message);
  }
};

const getPersonneByUserId = async (userId: number): Promise<Personne | null> => {
  try {
    return await prisma.personne.findFirst({
      where: { user: { id: userId } },
      include: {
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la récupération de la personne par ID utilisateur : " + error.message);
  }
};



export default {
  createPersonne,
  getAllPersonnes,
  getPersonneById,
  updatePersonne,
  deletePersonne,
  getPersonneByUserId,
};

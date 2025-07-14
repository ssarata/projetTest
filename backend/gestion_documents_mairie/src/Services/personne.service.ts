// On importe Prisma pour interagir avec la base de données, ainsi que les types utiles
import { PrismaClient, Personne, Prisma } from '@prisma/client';
import PersonneValidate from '../Validations/PersonneValidate';

// On initialise Prisma
const prisma = new PrismaClient();

/**
 * Créer une nouvelle personne dans la base de données
 */
const createPersonne = async (data: Prisma.PersonneCreateInput): Promise<Personne> => {
  try {
    const validatedData = PersonneValidate(data) as Prisma.PersonneCreateInput;
    return await prisma.personne.create({
      data: validatedData,
      include: {
        user: true, // On récupère aussi les infos liées au compte utilisateur
        documentPersonnes: {
          include: { document: true } // Et les documents liés à cette personne
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la création de la personne : " + error.message);
  }
};

/**
 * Récupérer toutes les personnes (même celles archivées)
 */
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

/**
 * Récupérer une personne par son identifiant
 */
const getPersonneById = async (id: number): Promise<Personne | null> => {
  try {
    return await prisma.personne.findUnique({
      where: { id },
      include: {
        user: true,
        documentPersonnes: {
          include: { document: true }
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

    const validatedData = PersonneValidate(data); // On valide les données reçues

    // On extrait les champs à mettre à jour
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

    // Supprimer les relations avec les documents si elles existent
    if (personne.documentPersonnes.length > 0) {
      await prisma.documentPersonne.deleteMany({
        where: { personneId: id }
      });
    }

    // Supprimer le compte utilisateur associé si existant
    if (personne.user) {
      await prisma.user.delete({
        where: { id: personne.user.id }
      });
    }

    // Supprimer la personne elle-même
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


const archiverPersonne = async (id: number, userId: number): Promise<Personne> => {
  try {
    const personne = await prisma.personne.findUnique({ where: { id } });

    if (!personne) {
      throw new Error(`La personne n'existe pas.`);
    }

    if (personne.archive) {
      throw new Error("La personne est déjà archivée.");
    }

    return await prisma.personne.update({
      where: { id },
      data: {
        archive: true,
        dateArchivage: new Date(),
        archiveParId: userId,
      },
      include: {
        user: true,
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de l'archivage de la personne : " + error.message);
  }
};


const restaurerPersonne = async (id: number, userId: number): Promise<Personne> => {
  try {
    const personne = await prisma.personne.findUnique({ where: { id } });

    if (!personne) {
      throw new Error(`La personne avec l'id ${id} n'existe pas.`);
    }

    if (!personne.archive) {
      throw new Error("La personne n'est pas archivée.");
    }

    return await prisma.personne.update({
      where: { id },
      data: {
        archive: false,
        dateArchivage: new Date(), 
        archiveParId: userId,
      },
      include: {
        user: true,
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la restauration de la personne : " + error.message);
  }
};


const getPersonnesArchivees = async (): Promise<Personne[]> => {
  try {
    return await prisma.personne.findMany({
      where: { archive: true },
      orderBy: { dateArchivage: 'desc' },
      include: {
        archivePar: {
          include: { personne: true }, // On affiche aussi qui a archivé la personne
        },
        documentPersonnes: {
          include: { document: true }
        }
      }
    });
  } catch (error: any) {
    throw new Error("Erreur lors de la récupération des personnes archivées : " + error.message);
  }
};

export default {
  createPersonne,
  getAllPersonnes,
  getPersonneById,
  updatePersonne,
  deletePersonne,
  getPersonneByUserId,
  archiverPersonne,
  restaurerPersonne,
  getPersonnesArchivees
};

import { PrismaClient, Mairie } from '@prisma/client';

const prisma = new PrismaClient();

const createMairie = async (data: Mairie): Promise<Mairie> => {
  try {
    return await prisma.mairie.create({ data });
  } catch (error: any) {
    throw new Error("Error creating mairie: " + error.message);
  }
};

const getAllMairies = async (): Promise<Mairie[]> => {
  try {
    return await prisma.mairie.findMany();
  } catch (error: any) {
    throw new Error("Error fetching mairies: " + error.message);
  }
};

const getMairieById = async (id: number): Promise<Mairie | null> => {
  try {
    return await prisma.mairie.findUnique({ where: { id } });
  } catch (error: any) {
    throw new Error("Error fetching mairie by ID: " + error.message);
  }
};

const updateMairie = async (id: number, data: Partial<Mairie>): Promise<Mairie> => {
  try {
    return await prisma.mairie.update({ where: { id }, data });
  } catch (error: any) {
    throw new Error("Error updating mairie: " + error.message);
  }
};

const deleteMairie = async (id: number): Promise<void> => {
  try {
    await prisma.mairie.delete({ where: { id } });
  } catch (error: any) {
    throw new Error("Error deleting mairie: " + error.message);
  }
};

export default {
  createMairie,
  getAllMairies,
  getMairieById,
  updateMairie,
  deleteMairie,
};
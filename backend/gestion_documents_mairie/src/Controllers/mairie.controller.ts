import { Request, Response } from 'express';
import mairieService from '../Services/mairie.service';
import { Mairie } from '@prisma/client';

// Étendre le type Request pour inclure la propriété `file` de multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const createMairie = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { ville, commune, region, prefecture,nomMaire,prenomMaire } = req.body;
    const logoFilename = req.file?.filename; // Multer stocke le nom du fichier téléversé ici

    if (!logoFilename) {
      res.status(400).json({ error: 'Le fichier du logo est requis.' });
      return;
    }

    const mairieData: Omit<Mairie, 'id'> = { // Omit 'id' car il est auto-incrémenté
      ville, commune, region, prefecture, logo: logoFilename,nomMaire, prenomMaire
    };

    const mairie = await mairieService.createMairie(mairieData as Mairie);
    res.status(201).json(mairie);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMairies = async (req: Request, res: Response): Promise<void> => {
  try {
    const mairies = await mairieService.getAllMairies();
    res.status(200).json(mairies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMairieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const mairie = await mairieService.getMairieById(id);
    if (!mairie) {
      res.status(404).json({ error: 'Mairie non trouvée' });
    } else {
      res.status(200).json(mairie);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMairie = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { ville, commune, region, prefecture } = req.body;
    const logoFilename = req.file?.filename; // Nouveau fichier de logo si fourni

    const updateData: Partial<Mairie> = {
      ville, commune, region, prefecture
    };

    if (logoFilename) {
      updateData.logo = logoFilename; // Mettre à jour le logo uniquement si un nouveau fichier est téléversé
    }

    const updatedMairie = await mairieService.updateMairie(id, updateData);
    res.status(200).json(updatedMairie);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMairie = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await mairieService.deleteMairie(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
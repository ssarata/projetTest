import { Request, Response } from 'express';
import personneService from '../Services/personne.service';

export const createPersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const personne = await personneService.createPersonne(req.body);
    res.status(201).json(personne);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllPersonnes = async (req: Request, res: Response): Promise<void> => {
  try {
    const personnes = await personneService.getAllPersonnes();
    res.status(200).json(personnes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPersonneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const personne = await personneService.getPersonneById(id);
    if (!personne) {
      res.status(404).json({ error: 'Personne non trouvée' });
    } else {
      res.status(200).json(personne);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedPersonne = await personneService.updatePersonne(id, req.body);
    res.status(200).json(updatedPersonne);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await personneService.deletePersonne(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPersonneByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const personne = await personneService.getPersonneByUserId(userId);
    if (!personne) {
      res.status(404).json({ error: 'Personne non trouvée pour cet utilisateur' });
    } else {
      res.status(200).json(personne);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


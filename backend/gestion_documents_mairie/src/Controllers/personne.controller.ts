// import : on va chercher ce qu’on a besoin pour faire marcher notre code
import { Request, Response } from 'express';

// personneService : c’est un copain qui fait tout le travail compliqué (comme créer une personne, la chercher, etc.)
import personneService from '../Services/personne.service';

// Créer une nouvelle personne
export const createPersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const personne = await personneService.createPersonne(req.body);
    res.status(201).json(personne); // 201 = création réussie
  } catch (error: any) {
    console.log("Erreur lors de la création de la personne :", error);
    
    res.status(400).json({ error: error.message }); // 400 = mauvaise requête
  }
};

// Récupérer toutes les personnes
export const getAllPersonnes = async (req: Request, res: Response): Promise<void> => {
  try {
    const personnes = await personneService.getAllPersonnes();
    res.status(200).json(personnes);
  } catch (error: any) {
    res.status(500).json({ error: error.message }); // 500 = erreur du serveur
  }
};

// Récupérer une personne par son ID
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

// Mettre à jour une personne
export const updatePersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedPersonne = await personneService.updatePersonne(id, req.body);
    res.status(200).json(updatedPersonne);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une personne
export const deletePersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await personneService.deletePersonne(id);
    res.status(204).send(); // 204 = supprimé avec succès, mais rien à renvoyer
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Chercher une personne à partir de son userId
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

// 🔒 Archiver une personne (au lieu de la supprimer définitivement)
export const archiverPersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10); // ID de la personne
    const userId = parseInt(req.body.userId); // ID de l'utilisateur qui archive (à envoyer dans le body)

    const personne = await personneService.archiverPersonne(id, userId);
    res.status(200).json(personne); // On renvoie la personne archivée
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// ♻️ Restaurer une personne archivée
export const restaurerPersonne = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = parseInt(req.body.userId); // Celui qui restaure

    const personne = await personneService.restaurerPersonne(id, userId);
    res.status(200).json(personne); // On renvoie la personne restaurée
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// 📦 Obtenir la liste des personnes archivées
export const getPersonnesArchivees = async (req: Request, res: Response): Promise<void> => {
  try {
    const personnes = await personneService.getPersonnesArchivees();
    res.status(200).json(personnes); // On renvoie la liste des archivées
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { Request, Response } from 'express';
import authService from '../Services/auth.service';
import { User } from '@prisma/client';


export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe sont requis' });
      return;
    }

    const { token, user } = await authService.login(email, password);

    if (!token || !user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    } else {
      res.status(200).json({ token, user });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};

/**
 * Controller pour l'inscription d'un nouvel utilisateur
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
export const registerController = async (req: Request, res: Response): Promise<void> => { // Déjà exporté, on modifie son contenu
  try {
    const { email, password, nom, prenom, profession, adresse, telephone } = req.body; // Inclure les champs optionnels de Personne

    // Vérification des champs requis
    if (!email || !password || !nom || !prenom) {
      res.status(400).json({ message: 'Email, mot de passe, nom et prénom sont requis.' });
      return;
    }

    const personneData = { nom, prenom, profession, adresse, telephone };
    // Appel au service pour créer un utilisateur
    const user = await authService.register(email, password, personneData);

    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user });
  } catch (error: any) {
    if (error.message === 'Un utilisateur avec cet email existe déjà' || 
        error.message === 'Les champs nom et prenom sont obligatoires') { // Cette dernière erreur est gérée dans le service
      res.status(400).json({ message: error.message });
    } else {
      console.error("Erreur dans registerController:", error);
      res.status(500).json({ message: 'Erreur interne du serveur lors de l\'enregistrement.', details: error.message });
    }
  }
};

/**
 * Controller pour récupérer un utilisateur par son ID
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.params.id;
    const userId = parseInt(userIdString, 10);

    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.status(200).json(user);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};


/**
 * Controller pour supprimer un utilisateur
 * Modifié pour archiver l'utilisateur au lieu de le supprimer définitivement.
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.params.id;
    const userId = parseInt(userIdString, 10);

    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }
    const archivedUser = await authService.archiveUser(userId);

    if (!archivedUser) { // Bien que archiveUser lève une erreur si non trouvé, gardons une vérification
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.status(200).json({ message: 'Utilisateur archivé avec succès', user: archivedUser });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};

/**
 * Controller pour mettre à jour un utilisateur
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
// L'importation de authService est déjà faite en haut du fichier.
// Supprimez cette ligne pour éviter l'erreur "Identificateur 'authService' en double".
// import * as authService from '../services/authService';

export const updateUserController = async (req: Request, res: Response): Promise<void> => { // Export this function
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }

    // Destructure fields from req.body according to UserUpdateData type
    const { email, nom, prenom, currentPassword, newPassword } = req.body;

    const updateData: {
      email?: string;
      nom?: string;
      prenom?: string;
      currentPassword?: string;
      newPassword?: string;
    } = { email, nom, prenom, currentPassword, newPassword };

    // On vérifie simplement que des données sont envoyées
    // Filter out undefined values to ensure only provided fields are sent
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      res.status(400).json({ error: 'Aucune donnée de mise à jour fournie.' });
      return;
    }

    const updatedUser = await authService.updateUser(userId, filteredUpdateData);

    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user: updatedUser });
  } catch (error: any) {
    // Gérer les erreurs spécifiques que le service pourrait lancer
    if (error.message === 'INVALID_CURRENT_PASSWORD') {
        // C'est un exemple, adaptez le message d'erreur à ce que votre service renvoie.
        res.status(400).json({ message: 'Le mot de passe actuel est incorrect.' });
    } else if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ message: 'Utilisateur non trouvé.' });
    } else {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
    }
  }
}

export const unarchiveUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }
    const user = await authService.unarchiveUser(userId);
    res.status(200).json({ message: "Utilisateur désarchivé avec succès.", user });
  } catch (error: any) {
    // Adaptez la gestion des erreurs
    if (error.message.includes("non trouvé")) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erreur serveur lors du désarchivage.", details: error.message });
    }
  }
};

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const archivedQuery = req.query.archived; // "true", "false", ou undefined
    let options: { archived?: boolean } | undefined;

    if (archivedQuery === 'true') {
      options = { archived: true };
    } else if (archivedQuery === 'false') {
      options = { archived: false };
    }
    // Si archivedQuery est undefined, options restera undefined, et getAllUsers retournera tout.

    const users = await authService.getAllUsers(options);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs.", details: error.message });
  }
};

export const getCurrentUser = (req, res) => {
  // req.user doit être rempli par ton middleware d'authentification
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  res.json(req.user);
};

/**
 * Controller pour supprimer définitivement un utilisateur (Admin requis)
 * @param req - La requête HTTP
 * @param res - La réponse HTTP
 */
export const permanentlyDeleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.params.id;
    const userId = parseInt(userIdString, 10);

    if (isNaN(userId)) {
      res.status(400).json({ message: "ID utilisateur invalide." });
      return;
    }

    // La vérification du rôle ADMIN est déjà faite par le middleware `ensureAdmin` sur la route
    await authService.permanentlyDeleteUserById(userId);

    res.status(200).json({ message: 'Utilisateur supprimé définitivement avec succès' });
  } catch (error: any) {
    if (error.message === 'Utilisateur non trouvé') {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    } else {
      res.status(500).json({ message: 'Erreur lors de la suppression définitive de l\'utilisateur', details: error.message });
    }
  }
};

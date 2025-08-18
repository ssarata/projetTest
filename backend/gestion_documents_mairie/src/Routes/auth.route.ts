import express, { Request, Response, NextFunction } from 'express';
import authService from '../Services/auth.service';
import {
  registerController, // Importer le registerController
  deleteUserController,
  unarchiveUserController,
  permanentlyDeleteUserController,
  getAllUsersController,
  updateUserController,
  getCurrentUser } from '../Controllers/auth.controller'; // Import updateUserController
import authenticateToken, { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ensureAdmin } from '../middlewares/ensureAdmin'; // Importer le middleware ensureAdmin
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); 


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentification
 *   description: Gestion de l'authentification des utilisateurs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur (Admin requis)
 *     security:
 *       - bearerAuth: [] # Indique que cette route nécessite une authentification Bearer
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (rôle non admin)
 */

// Nouveau middleware pour gérer l'enregistrement initial ou exiger l'admin
const initialRegistrationOrAdminRequired = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const usersCount = await prisma.user.count();
    if (usersCount === 0) {
      // Aucun utilisateur n'existe : c'est la création du premier (futur admin).
      // Pas besoin d'authenticateToken ni d'ensureAdmin pour cet appel spécifique.
      return next();
    } else {
      // Des utilisateurs existent déjà : authentification et autorisation admin requises.
      authenticateToken(req, res, (authError?: any) => {
        if (authError) { // Si authenticateToken passe une erreur à next()
          return next(authError);
        }
        // Si authenticateToken a envoyé une réponse, res.headersSent sera true.
        // S'il a appelé next() sans erreur, req.user devrait être défini.
        if (!res.headersSent) { // Vérifier si une réponse n'a pas déjà été envoyée
          if (req.user) { // Vérifier si l'utilisateur a été attaché à la requête
            ensureAdmin(req, res, next); // ensureAdmin appellera next() ou enverra une réponse
          } else {
            // Ce cas peut survenir si authenticateToken appelle next() sans définir req.user et sans envoyer de réponse.
            // Ou si authenticateToken n'a pas été appelé correctement dans la chaîne.
             res.status(401).json({ message: "Authentification requise mais utilisateur non défini après le middleware d'authentification." });
          }
        }
        // Si res.headersSent est true, authenticateToken a déjà répondu, donc on ne fait rien ici.
      });
    }
  } catch (dbError) {
    console.error("Erreur lors de la vérification du nombre d'utilisateurs:", dbError);
    res.status(500).json({ message: "Erreur serveur lors de la préparation de l'enregistrement." });
  }
};

router.post(
  '/register',
  initialRegistrationOrAdminRequired, // Utiliser le nouveau middleware conditionnel
  registerController                  // Utiliser le contrôleur extrait
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe sont requis.' });
      return;
    }
    // authService.login lèvera une exception si les identifiants sont invalides ou si le compte est archivé
    const result = await authService.login(email, password);
    res.status(200).json(result); // Contient { token, user }
  } catch (error: any) {
    console.error('Login attempt failed:', error.message); // Log pour le débogage serveur
    if (error.message.includes('Identifiants invalides')) {
      res.status(401).json({ message: 'Identifiants invalides.' });
    } else if (error.message.includes('Compte archivé')) {
      // Message spécifique si le service a levé cette erreur
      res.status(403).json({ message: 'Votre compte est archivé et ne peut plus être utilisé. Veuillez contacter l\'administrateur.' });
    } else {
      // Erreur générique pour les autres cas
      res.status(500).json({ message: 'Une erreur est survenue lors de la connexion.' });
    }
  }
});

/**
 * @swagger
 * /auth/user/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Authentification]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/user/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id)
    if (isNaN(userId)) {
      res.status(400).json({ message: "ID invalide (doit être un entier)" })
      return
    }

    // Optionnel : Vérifier si l'utilisateur authentifié a le droit de voir cet utilisateur
    // Par exemple, un utilisateur ne peut voir que son propre profil, ou un admin peut tout voir.
    // if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
    //   return res.status(403).json({ message: "Accès non autorisé à ces informations utilisateur." });
    // }
    const user = await authService.getUserById(userId)
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' })
    } else {
      res.status(200).json(user)
    }
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur." })
  }
})


/**
 * @swagger
 * /auth/user/{id}:
 *   delete:
 *     summary: Archiver un utilisateur par ID (soft delete)
 *     tags: [Authentification]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur archivé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 */
router.delete('/user/:id', authenticateToken, deleteUserController); // Utilise le contrôleur qui archive
// Note: Si seul un admin peut archiver, `ensureAdmin` devrait être ajouté ici ou dans le `deleteUserController`.
// router.delete('/user/:id', authenticateToken, ensureAdmin, deleteUserController);

/**
 * @swagger
 * /auth/user/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur par ID
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       400:
 *         description: Erreur de mise à jour
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé (par exemple, essayer de modifier un autre utilisateur sans être admin)
 */

router.put('/user/:id', authenticateToken, updateUserController);


/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs (actifs par défaut, ou filtrés par statut archivé)
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut archivé (true pour archivés, false pour actifs, non spécifié pour tous)
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       500:
 *         description: Erreur serveur
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 */
 router.get('/users', authenticateToken, getAllUsersController);
// Note: Si seul un admin peut voir tous les utilisateurs, `ensureAdmin` devrait être ajouté ici ou dans le `getAllUsersController`.
// router.get('/users', authenticateToken, ensureAdmin, getAllUsersController);


/**
 * @swagger
 * /auth/user/{id}/unarchive:
 *   patch:
 *     summary: Désarchiver un utilisateur par ID
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à désarchiver
 *     responses:
 *       200:
 *         description: Utilisateur désarchivé avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       500:
 *         description: Erreur serveur
 */
router.patch('/user/:id/unarchive', authenticateToken, unarchiveUserController);
// Note: Si seul un admin peut désarchiver, `ensureAdmin` devrait être ajouté ici ou dans le `unarchiveUserController`.
// router.patch('/user/:id/unarchive', authenticateToken, ensureAdmin, unarchiveUserController);

/**
 * @swagger
 * /auth/user/{id}/force-delete:
 *   delete:
 *     summary: Supprime définitivement un utilisateur (Admin requis)
 *     description: Permet à un administrateur de supprimer définitivement un utilisateur. Cette action est irréversible.
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur à supprimer définitivement
 *     responses:
 *       200:
 *         description: Utilisateur supprimé définitivement avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès refusé. Rôle admin requis.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur
 */
router.delete('/user/:id/force-delete', authenticateToken, ensureAdmin, permanentlyDeleteUserController);

router.get("/me", authenticateToken, getCurrentUser); // <-- Ajoute cette ligne

export default router;

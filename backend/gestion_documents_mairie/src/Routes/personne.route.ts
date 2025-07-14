import { Router } from 'express';
import {
  createPersonne,
  getAllPersonnes,
  getPersonneById,
  updatePersonne,
  deletePersonne,
  getPersonneByUserId,
  archiverPersonne,
  restaurerPersonne,
  getPersonnesArchivees
} from '../Controllers/personne.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = Router(); // Création du routeur Express

// 👤 Créer une nouvelle personne (authentification requise)
router.post('/', authenticateToken, createPersonne);

// 📋 Obtenir toutes les personnes non archivées (authentification requise)
router.get('/', authenticateToken, getAllPersonnes);

// 📦 Obtenir toutes les personnes archivées
router.get('/archives', authenticateToken, getPersonnesArchivees);

// 🔍 Obtenir une personne à partir d'un ID utilisateur (authentification requise)
router.get('/user/:userId', authenticateToken, getPersonneByUserId);

// 🔍 Obtenir une personne par son ID (publique ou protégé selon ton usage)
router.get('/:id', getPersonneById);

// ✏️ Mettre à jour les infos d’une personne
router.put('/:id', updatePersonne);

// 📦 Archiver une personne (authentification requise)
router.put('/:id/archiver', authenticateToken, archiverPersonne);

// 🔁 Restaurer une personne archivée (authentification requise)
router.put('/:id/restaurer', authenticateToken, restaurerPersonne);

// ❌ Supprimer une personne (authentification requise)
router.delete('/:id', authenticateToken, deletePersonne);

export default router;

/**
 * @swagger
 * tags:
 *   name: Personnes
 *   description: Gestion des personnes
 */

/**
 * @swagger
 * /api/personnes:
 *   post:
 *     summary: Crée une nouvelle personne
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
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
 *               profession:
 *                 type: string
 *               adresse:
 *                 type: string
 *               telephone:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *               nationalite:
 *                 type: string
 *               numeroCni:
 *                 type: string
 *               sexe:
 *                 type: string
 *               lieuNaissance:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personne créée avec succès
 *       400:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /api/personnes:
 *   get:
 *     summary: Récupère toutes les personnes
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des personnes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personne'
 */

/**
 * @swagger
 * /api/personnes/archives:
 *   get:
 *     summary: Récupère toutes les personnes archivées
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des personnes archivées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personne'
 */

/**
 * @swagger
 * /api/personnes/{id}:
 *   get:
 *     summary: Récupère une personne par ID
 *     tags: [Personnes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la personne
 *     responses:
 *       200:
 *         description: Détails de la personne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personne'
 *       404:
 *         description: Personne non trouvée
 */

/**
 * @swagger
 * /api/personnes/user/{userId}:
 *   get:
 *     summary: Récupère une personne par ID utilisateur
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur lié
 *     responses:
 *       200:
 *         description: Personne trouvée
 *       404:
 *         description: Aucune personne liée à cet utilisateur
 */

/**
 * @swagger
 * /api/personnes/{id}:
 *   put:
 *     summary: Met à jour une personne
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la personne
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
 *               profession:
 *                 type: string
 *               adresse:
 *                 type: string
 *               telephone:
 *                 type: string
 *               dateNaissance:
 *                 type: string
 *               nationalite:
 *                 type: string
 *               numeroCni:
 *                 type: string
 *               sexe:
 *                 type: string
 *               lieuNaissance:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personne mise à jour avec succès
 *       404:
 *         description: Personne non trouvée
 */

/**
 * @swagger
 * /api/personnes/{id}/archiver:
 *   put:
 *     summary: Archive une personne (suppression logique)
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la personne à archiver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Personne archivée avec succès
 *       400:
 *         description: Erreur lors de l'archivage
 */

/**
 * @swagger
 * /api/personnes/{id}/restaurer:
 *   put:
 *     summary: Restaure une personne archivée
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la personne à restaurer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Personne restaurée avec succès
 *       400:
 *         description: Erreur lors de la restauration
 */

/**
 * @swagger
 * /api/personnes/{id}:
 *   delete:
 *     summary: Supprime une personne
 *     tags: [Personnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la personne
 *     responses:
 *       204:
 *         description: Personne supprimée avec succès
 *       404:
 *         description: Personne non trouvée
 */

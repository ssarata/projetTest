import { Router } from 'express';
import {
  createPersonne,
  getAllPersonnes,
  getPersonneById,
  updatePersonne,
  deletePersonne,
  getPersonneByUserId,
} from '../Controllers/personne.controller';
import authenticateToken from '../middlewares/authMiddleware';

const router = Router();

// Routes pour la table Personne

router.post('/', authenticateToken, createPersonne);
router.get('/', authenticateToken, getAllPersonnes);
router.get('/user/:userId',  getPersonneByUserId);
router.get('/:id',  getPersonneById);
router.put('/:id',  updatePersonne);
router.delete('/:id',  deletePersonne);


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
 *     responses:
 *       200:
 *         description: Liste des personnes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nom:
 *                     type: string
 *                   prenom:
 *                     type: string
 *                   profession:
 *                     type: string
 *                   adresse:
 *                     type: string
 *                   telephone:
 *                     type: string
 *                   dateNaissance:
 *                     type: string
 *                   nationalite:
 *                     type: string
 *                   numeroCni:
 *                     type: string
 *                   sexe:
 *                     type: string
 *                   lieuNaissance:
 *                     type: string
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
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *                 profession:
 *                   type: string
 *                 adresse:
 *                   type: string
 *                 telephone:
 *                   type: string
 *                 dateNaissance:
 *                   type: string
 *                 nationalite:
 *                   type: string
 *                 numeroCni:
 *                   type: string
 *                 sexe:
 *                   type: string
 *                 lieuNaissance:
 *                   type: string
 *       404:
 *         description: Personne non trouvée
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

/**
 * @swagger
 * /api/personnes/{id}/document-count:
 *   get:
 *     summary: Récupère le nombre de documents distincts liés à une personne
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
 *         description: Nombre de documents distincts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentCount:
 *                   type: integer
 *       404:
 *         description: Personne non trouvée
 */
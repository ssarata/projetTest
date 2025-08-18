import express from 'express';
import { DocumentPersonneController } from '../Controllers/DocumentPersonne.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import { ensureAdmin } from '../middlewares/ensureAdmin'; // Importer le middleware ensureAdmin

const routes = express.Router();
const controller = new DocumentPersonneController();
routes.post('/',authenticateToken, controller.create.bind(controller));
routes.get('/',authenticateToken, controller.findAll.bind(controller));
routes.get('/:id', authenticateToken,controller.findById.bind(controller));
routes.put('/:id',authenticateToken, controller.update.bind(controller));
routes.delete('/:id',authenticateToken, controller.delete.bind(controller));
routes.get('/document/:documentId', authenticateToken, controller.findByDocumentId.bind(controller));


export default routes;

/**
 * @swagger
 * tags:
 *   name: DocumentPersonnes
 *   description: Gestion des relations entre documents et personnes
 */

/**
 * @swagger
 * /document-personnes:
 *   post:
 *     summary: Associe une personne à un document
 *     tags: [DocumentPersonnes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fonction:
 *                 type: string
 *               documentId:
 *                 type: integer
 *               personneId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Relation créée avec succès
 *       400:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /document-personnes:
 *   get:
 *     summary: Récupère toutes les relations entre documents et personnes
 *     tags: [DocumentPersonnes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des relations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fonction:
 *                     type: string
 *                   documentId:
 *                     type: integer
 *                   personneId:
 *                     type: integer
 */

/**
 * @swagger
 * /api/document-personnes/{id}:
 *   get:
 *     summary: Récupère une relation entre un document et une personne par ID
 *     tags: [DocumentPersonnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la relation
 *     responses:
 *       200:
 *         description: Détails de la relation
 *       404:
 *         description: Relation non trouvée
 */

/**
 * @swagger
 * /api/document-personnes/{id}:
 *   put:
 *     summary: Met à jour une relation entre un document et une personne
 *     tags: [DocumentPersonnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la relation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fonction:
 *                 type: string
 *               documentId:
 *                 type: integer
 *               personneId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Relation mise à jour avec succès
 *       404:
 *         description: Relation non trouvée
 */

/**
 * @swagger
 * /api/document-personnes/{id}:
 *   delete:
 *     summary: Supprime une relation entre un document et une personne
 *     tags: [DocumentPersonnes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la relation
 *     responses:
 *       204:
 *         description: Relation supprimée avec succès
 *       404:
 *         description: Relation non trouvée
 */

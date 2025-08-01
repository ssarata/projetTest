import { Router } from 'express';
import { VariableController } from '../Controllers/Variable.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const routes = Router();
const controller = new VariableController();

routes.post('/',authenticateToken, controller.create.bind(controller));
routes.get('/',authenticateToken, controller.findAll.bind(controller));
routes.get('/:id', authenticateToken,controller.findByID.bind(controller));
routes.put('/:id',authenticateToken, controller.update.bind(controller));
routes.delete('/:id',authenticateToken, controller.delete.bind(controller));
// routes.get('/template/:templateId', controller.findByTemplate.bind(controller));

export default routes;

/**
 * @swagger
 * tags:
 *   name: Variables
 *   description: Gestion des variables
 */

/**
 * @swagger
 * /api/variables:
 *   post:
 *     summary: Crée une nouvelle variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomVariable:
 *                 type: string
 *     responses:
 *       201:
 *         description: Variable créée avec succès
 *       400:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /api/variables:
 *   get:
 *     summary: Récupère toutes les variables
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des variables
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nomVariable:
 *                     type: string
 */

/**
 * @swagger
 * /api/variables/{id}:
 *   get:
 *     summary: Récupère une variable par ID
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la variable
 *     responses:
 *       200:
 *         description: Détails de la variable
 *       404:
 *         description: Variable non trouvée
 */

/**
 * @swagger
 * /api/variables/{id}:
 *   put:
 *     summary: Met à jour une variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la variable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomVariable:
 *                 type: string
 *     responses:
 *       200:
 *         description: Variable mise à jour avec succès
 *       404:
 *         description: Variable non trouvée
 */

/**
 * @swagger
 * /api/variables/{id}:
 *   delete:
 *     summary: Supprime une variable
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la variable
 *     responses:
 *       204:
 *         description: Variable supprimée avec succès
 *       404:
 *         description: Variable non trouvée
 */
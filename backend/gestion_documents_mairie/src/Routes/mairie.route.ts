import { Router } from 'express';
import upload from '../middlewares/upload.js';
import {
  createMairie,
  getAllMairies,
  getMairieById,
  updateMairie,
  deleteMairie,
} from '../Controllers/mairie.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken,upload.single('logo'), createMairie);
router.put('/:id',authenticateToken, upload.single('logo'), updateMairie); 
router.get('/', authenticateToken,getAllMairies);
router.get('/:id', getMairieById);
router.delete('/:id',authenticateToken, deleteMairie);

export default router;

/**
 * @swagger
 * tags:
 *   name: Mairies
 *   description: Gestion des mairies
 */

/**
 * @swagger
 * /api/mairies:
 *   get:
 *     summary: Récupère toutes les mairies
 *     tags: [Mairies]
 *     responses:
 *       200:
 *         description: Liste des mairies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   ville:
 *                     type: string
 *                   commune:
 *                     type: string
 *                   region:
 *                     type: string
 *                   prefecture:
 *                     type: string
 *               nomMaire:
 *                 type: string
 *               prenomMaire:
 *                 type: string
 */

/**
 * @swagger
 * /api/mairies/{id}:
 *   get:
 *     summary: Récupère une mairie par ID
 *     tags: [Mairies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mairie
 *     responses:
 *       200:
 *         description: Détails de la mairie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 ville:
 *                   type: string
 *                 commune:
 *                   type: string
 *                 region:
 *                   type: string
 *                 prefecture:
 *                   type: string
 *       404:
 *         description: Mairie non trouvée
 */

/**
 * @swagger
 * /api/mairies:
 *   post:
 *     summary: Crée une nouvelle mairie
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ville:
 *                 type: string
 *               commune:
 *                 type: string
 *               region:
 *                 type: string
 *               prefecture:
 *                 type: string
 *               nomMaire:
 *                 type: string
 *               prenomMaire:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Mairie créée avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 */

/**
 * @swagger
 * /api/mairies/{id}:
 *   put:
 *     summary: Met à jour une mairie
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mairie
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ville:
 *                 type: string
 *               commune:
 *                 type: string
 *               region:
 *                 type: string
 *               prefecture:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Mairie mise à jour avec succès
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       404:
 *         description: Mairie non trouvée
 */

/**
 * @swagger
 * /api/mairies/{id}:
 *   delete:
 *     summary: Supprime une mairie
 *     tags: [Mairies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la mairie
 *     responses:
 *       204:
 *         description: Mairie supprimée avec succès
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       404:
 *         description: Mairie non trouvée
 */
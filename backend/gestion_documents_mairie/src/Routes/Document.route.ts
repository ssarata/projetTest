import { Router } from 'express';
import { DocumentController } from '../Controllers/Document.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const routes = Router();
const controller = new DocumentController();

routes.post('/', authenticateToken, controller.createDocument.bind(controller));
routes.get('/archives', authenticateToken, controller.getDocumentsArchives.bind(controller));
routes.get('/', authenticateToken, controller.getAllDocuments.bind(controller));
routes.get('/:id', authenticateToken, controller.getDocumentById.bind(controller));
routes.put('/:id', authenticateToken, controller.updateDocument.bind(controller));
routes.delete('/:id', authenticateToken, controller.deleteDocument.bind(controller));
routes.put('/:id/archiver', authenticateToken, controller.archiverDocument.bind(controller));
routes.put('/:id/desarchiver', authenticateToken, controller.desarchiverDocument.bind(controller));
routes.delete('/:id/force', authenticateToken, controller.deleteDocumentDefinitivement.bind(controller));

export default routes;
 
/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Gestion des documents
 */

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Crée un nouveau document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               identiteDuMaire:
 *                 type: string
 *               templateId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Document créé avec succès
 *       400:
 *         description: Erreur de validation
 */


/**
 * @swagger
 * /api/documents/archives:
 *   get:
 *     summary: Récupère les documents archivés
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des documents archivés
  *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 */


/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Récupère tous les documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Liste des documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   identiteDuMaire:
 *                     type: string
 *                   templateId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 */

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Récupère un document par ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du document
 *     responses:
 *       200:
 *         description: Détails du document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 identiteDuMaire:
 *                   type: string
 *                 templateId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *       404:
 *         description: Document non trouvé
 */

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Met à jour un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               identiteDuMaire:
 *                 type: string
 *               templateId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Document mis à jour avec succès
 *       404:
 *         description: Document non trouvé
 */
/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Supprime un document par ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à supprimer
 *     responses:
 *       200:
 *         description: Document supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Document non trouvé
 */
/**
 * @swagger
 * /api/documents/{id}/archiver:
 *   put:
 *     summary: Archive un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à archiver
 *     responses:
 *       200:
 *         description: Document archivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 document:
 *                   type: object
 *       404:
 *         description: Document non trouvé
 */
/**
 * @swagger
 * /api/documents/{id}/desarchiver:
 *   put:
 *     summary: Désarchive un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du document
 *     responses:
 *       200:
 *         description: Document désarchivé avec succès
 *       404:
 *         description: Document non trouvé
 */
/**
 * @swagger
 * /api/documents/{id}/force:
 *   delete:
 *     summary: Supprime définitivement un document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du document à supprimer définitivement
 *     responses:
 *       200:
 *         description: Document supprimé définitivement avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
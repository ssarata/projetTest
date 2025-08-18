import { Router } from 'express';
import { DocumentTemplateController } from '../Controllers/DocumentTemplate.controller.js';
import authenticateToken from '../middlewares/authMiddleware.js';
import { ensureAdmin } from '../middlewares/ensureAdmin'; // Importer le middleware ensureAdmin

const routes = Router();
const controller = new DocumentTemplateController();

// Création d'un template
routes.post('/', authenticateToken,ensureAdmin, controller.create.bind(controller));

// Lister tous les templates
routes.get('/', authenticateToken, ensureAdmin, controller.findAll.bind(controller));

// Lister tous les templates archivés
routes.get('/archives', authenticateToken,ensureAdmin, controller.getTemplatesArchives.bind(controller));

// Archiver un template
routes.put('/archiver/:id', authenticateToken,ensureAdmin, controller.archiver.bind(controller));

// Restaurer un template archivé
routes.put('/restaurer/:id', authenticateToken,ensureAdmin, controller.restaurer.bind(controller));

// Supprimer définitivement un template
routes.delete('/:id/force', authenticateToken,ensureAdmin, controller.delete.bind(controller));

// Supprimer un template (normal)
//routes.delete('/:id', authenticateToken, controller.deleteDocumentTemplate.bind(controller));

// Mettre à jour un template
routes.put('/:id', authenticateToken, ensureAdmin,controller.update.bind(controller));

// Récupérer un template par ID
routes.get('/get/:id', ensureAdmin,authenticateToken, controller.findById.bind(controller));

// Créer une liaison entre une variable et un template
//routes.post('/:variableId/:documentTemplateId', authenticateToken, controller.createTemplateVariable.bind(controller));

// Récupérer un template par type de document (à garder en dernier)

export default routes;


/**
 * @swagger
 * tags:
 *   name: DocumentTemplates
 *   description: Gestion des modèles de documents
 */

/**
 * @swagger
 * /api/document-templates:
 *   post:
 *     summary: Crée un nouveau modèle de document
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeDocument:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modèle de document créé avec succès
 *       400:
 *         description: Erreur de validation
 */

/**
 * @swagger
 * /api/document-templates:
 *   get:
 *     summary: Récupère tous les modèles de documents
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modèles de documents
 */

/**
 * @swagger
 * /api/document-templates/archives:
 *   get:
 *     summary: Récupère tous les modèles archivés
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modèles archivés
 */

/**
 * @swagger
 * /api/document-templates/get/{id}:
 *   get:
 *     summary: Récupère un modèle de document par ID
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du modèle
 *     responses:
 *       200:
 *         description: Détails du modèle
 *       404:
 *         description: Modèle non trouvé
 */

/**
 * @swagger
 * /api/document-templates/{typeDocument}:
 *   get:
 *     summary: Récupère les modèles par type
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: typeDocument
 *         required: true
 *         schema:
 *           type: string
 *         description: Type de document
 *     responses:
 *       200:
 *         description: Liste des modèles filtrés
 */

/**
 * @swagger
 * /api/document-templates/{id}:
 *   put:
 *     summary: Met à jour un modèle de document
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du modèle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeDocument:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Modèle mis à jour avec succès
 *       404:
 *         description: Modèle non trouvé
 */

/**
 * @swagger
 * /api/document-templates/{id}:
 *   delete:
 *     summary: Supprime un modèle de document
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du modèle
 *     responses:
 *       200:
 *         description: Modèle supprimé avec succès
 *       404:
 *         description: Modèle non trouvé
 */

/**
 * @swagger
 * /api/document-templates/archiver/{id}:
 *   put:
 *     summary: Archive un modèle de document
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du modèle à archiver
 *     responses:
 *       200:
 *         description: Modèle archivé avec succès
 */

/**
 * @swagger
 * /api/document-templates/restaurer/{id}:
 *   put:
 *     summary: Restaure un modèle archivé
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du modèle à restaurer
 *     responses:
 *       200:
 *         description: Modèle restauré avec succès
 */

/**
 * @swagger
 * /api/document-templates/{variableId}/{documentTemplateId}:
 *   post:
 *     summary: Ajoute une variable à un modèle
 *     tags: [DocumentTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: variableId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: documentTemplateId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Variable ajoutée au modèle
 */
/**
 * @swagger
 * /api/document-templates/{id}/force:
 *   delete:
 *     summary: Supprime définitivement un document
 *     tags: [DocumentTemplates]
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
 *                   example: Document supprimé définitivement avec succès
 *       404:
 *         description: Document non trouvé
 */

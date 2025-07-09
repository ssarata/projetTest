import {
  HTTP_200_OK,
  HTTP_201_CREATE,
  HTTP_500_INTERNAL_SERVER_ERROR,
  HTTP_404_NOT_FOUND,
  HTTP_204_NO_CONTENT
} from "../Constantes/httpStatus";
import DocumentTemplateService from "../Services/DocumentTemplate.service";
import TemplateValidate from "../Validations/TemplateValidate";
import { Request, Response } from "express";

export class DocumentTemplateController {
  private templateService: DocumentTemplateService;

  constructor() {
    this.templateService = new DocumentTemplateService();
  }

  // Créer un nouveau template
  async create(req: Request, res: Response): Promise<void> {
  try {
    // Validation des données
    const result = TemplateValidate(req.body);

    // Appel du service pour créer le template
    const template = await this.templateService.createTemplate(result as { content: string; typeDocument: string });

    // Réponse HTTP 201 avec le template créé
    res.status(HTTP_201_CREATE).json(template);
  } catch (error: any) {
    // Gestion des erreurs
    console.error(error);
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

  // Créer un lien entre une variable et un template

  // Récupérer tous les templates
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.templateService.getAllTemplates();
      res.status(HTTP_200_OK).json(templates);
    } catch (error: any) {
      res
        .status(HTTP_500_INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  // Récupérer un template par ID
  async findById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    try {
      const template = await this.templateService.getTemplateById(id);
      if (!template) {
        res.status(HTTP_404_NOT_FOUND).json({ error: "Template non trouvé" });
        return;
      }
      res.status(HTTP_200_OK).json(template);
    } catch (error: any) {
      console.error(error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({
        error: "Erreur lors de la récupération du template",
      });
    }
  }
  // Mettre à jour un template
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    try {
      const result = TemplateValidate(data);
      result.typeDocument = data.typeDocument;

      const template = await this.templateService.updateTemplate(id, result);
      res.status(HTTP_200_OK).json(template);
    } catch (error: any) {
      res
        .status(HTTP_500_INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

    

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    try {
      const result = await this.templateService.deleteDefinitivementTemplate(id);
      if (result) {
        res.status(HTTP_204_NO_CONTENT).send(); // ✅ Rien à retourner
      } else {
        res.status(HTTP_404_NOT_FOUND).json({ error: "Template non trouvé" });
      }
    } catch (error: any) {
      if (error.message && error.message.includes("rattaché à au moins un document")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
      }
    }
  }

  async archiver(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: "Utilisateur non authentifié" });
      return;
    }

    try {
      const result = await this.templateService.archiverTemplate(id, userId);
      res.status(HTTP_200_OK).json(result);
    } catch (error: any) {
      console.error("Erreur archivage :", error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async restaurer(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: "Utilisateur non authentifié" });
       return;
    }

    try {
      const result = await this.templateService.restaurerTemplate(id, userId);
      res.status(HTTP_200_OK).json(result);
    } catch (error: any) {
      console.error("Erreur restauration :", error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async getTemplatesArchives(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.templateService.getTemplatesArchives();
      res.status(HTTP_200_OK).json(templates);
    } catch (error: any) {
      console.error("Erreur récupération des templates archivés :", error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  async deleteDocumentDefinitivement(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    try {
      await this.templateService.deleteDefinitivementTemplate(id);
      res.status(HTTP_200_OK).json({
        message: "Document supprimé définitivement avec succès",
      });
    } catch (error: any) {
      console.error("Erreur suppression définitive :", error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
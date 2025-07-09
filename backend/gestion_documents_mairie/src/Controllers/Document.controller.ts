import {
  HTTP_200_OK,
  HTTP_201_CREATE,
  HTTP_500_INTERNAL_SERVER_ERROR,
  HTTP_404_NOT_FOUND,
} from "../Constantes/httpStatus";
import { Request, Response } from "express";
import DocumentService from "../Services/Document.service";

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // Récupérer tous les documents
  async getAllDocuments(req: Request, res: Response): Promise<void> {
    try {
      const documents = await this.documentService.getAllDocuments();
      res.status(HTTP_200_OK).json(documents);
    } catch (error: any) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Récupérer un document par ID
  async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const document = await this.documentService.getDocumentById(id);
      if (!document) {
        res.status(HTTP_404_NOT_FOUND).json({ message: "Document not found" });
        return; // Ajout d'un `return` explicite pour éviter de continuer l'exécution
      }
      res.status(HTTP_200_OK).json(document);
    } catch (error: any) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Créer un nouveau document
  async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const documentData = req.body;

      // Définir la date actuelle
      documentData.date = new Date().toISOString();
      

      // Récupérer l'ID de l'utilisateur connecté
     const userId = (req as any).user?.userId;
     //const userId=1; // Assurez-vous que `req.user` est défini par un middleware d'authentification
      if (!userId) {
        res
          .status(HTTP_500_INTERNAL_SERVER_ERROR)
          .json({ error: "Utilisateur non authentifié" });
        return; // Ajout d'un `return` explicite
      }
      documentData.userId = userId;
      console.log(documentData);
      
      const newDocument = await this.documentService.addDocument(documentData);
      res.status(HTTP_201_CREATE).json(newDocument);
    } catch (error: any) {
      console.log(error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Mettre à jour un document
  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const documentData = req.body;

      const updatedDocument = await this.documentService.updateDocument(
        id,
        documentData
      );
      if (!updatedDocument) {
        res
          .status(HTTP_404_NOT_FOUND)
          .json({ message: "Document not found" });
        return; // Ajout d'un `return` explicite
      }
      res.status(HTTP_200_OK).json(updatedDocument);
    } catch (error: any) {
      console.log(error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Supprimer un document (soft-delete / archivage)
async deleteDocument(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);

    // Vérifier si l'utilisateur est authentifié
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: "Utilisateur non authentifié" });
      return;
    }

    // Appeler la méthode d'archivage comme une suppression logique
    const archivedDocument = await this.documentService.archiverDocument(id, userId);

    if (!archivedDocument) {
      res.status(HTTP_404_NOT_FOUND).json({ message: "Document non trouvé ou déjà supprimé" });
      return;
    }

    res.status(HTTP_200_OK).json({
      message: "Document supprimé (archivé) avec succès",
      document: archivedDocument,
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}


    // Archiver un document
  async archiverDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const userId = (req as any).user?.userId;
      if (!userId) {
        res
          .status(HTTP_500_INTERNAL_SERVER_ERROR)
          .json({ error: "Utilisateur non authentifié" });
        return;
      }

      const archivedDocument = await this.documentService.archiverDocument(id, userId);
      if (!archivedDocument) {
        res
          .status(HTTP_404_NOT_FOUND)
          .json({ message: "Document non trouvé ou erreur d’archivage" });
        return;
      }

      res.status(HTTP_200_OK).json({
        message: "Document archivé avec succès",
        document: archivedDocument,
      });
    } catch (error: any) {
      console.error(`Erreur dans DocumentController.deleteDocument pour ID ${req.params.id}:`, error);
      // Vérifier si l'erreur est celle que nous avons lancée pour "non trouvé"
      if (error.message.includes("non trouvé")) {
        res.status(HTTP_404_NOT_FOUND).json({ error: error.message });
      } else {
        res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: "Erreur lors de la suppression du document." });
      }
    }
  }

  // Désarchiver un document
  async desarchiverDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      const desarchivedDocument = await this.documentService.desarchiverDocument(id);
      if (!desarchivedDocument) {
        res
          .status(HTTP_404_NOT_FOUND)
          .json({ message: "Document non trouvé ou erreur de désarchivage" });
        return;
      }

      res.status(HTTP_200_OK).json({
        message: "Document désarchivé avec succès",
        document: desarchivedDocument,
      });
    } catch (error: any) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Supprimer définitivement un document// Supprimer définitivement un document
async deleteDocumentDefinitivement(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);

    await this.documentService.deleteDocumentDefinitivement(id);

    res.status(HTTP_200_OK).json({
      message: "Document supprimé définitivement avec succès",
    });
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}
// OK : aucun usage de req.params.id ici
async getDocumentsArchives(req: Request, res: Response): Promise<void> {
  try {
    const documents = await this.documentService.getAllDocumentsArchives();
    res.status(HTTP_200_OK).json(documents);
  } catch (error: any) {
    res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}

}
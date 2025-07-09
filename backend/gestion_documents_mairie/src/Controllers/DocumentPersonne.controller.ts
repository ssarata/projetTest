import { Request, Response } from 'express';
import DocumentPersonneService from '../Services/DocumentPersonne.service';

export class DocumentPersonneController {
  private documentPersonneService: DocumentPersonneService;

  constructor() {
    this.documentPersonneService = new DocumentPersonneService();
  }

  // Créer une nouvelle entrée
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const newDocumentPersonne = await this.documentPersonneService.createDocumentPersonne(data);
      res.status(201).json(newDocumentPersonne);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer toutes les entrées
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const documentPersonnes = await this.documentPersonneService.getAllDocumentPersonnes();
      res.status(200).json(documentPersonnes);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer une entrée par ID
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const documentPersonne = await this.documentPersonneService.getDocumentPersonneById(id);
      if (!documentPersonne) {
        res.status(404).json({ error: 'DocumentPersonne non trouvé' });
        return;
      }
      res.status(200).json(documentPersonne);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour une entrée
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      const updatedDocumentPersonne = await this.documentPersonneService.updateDocumentPersonne(id, data);
      res.status(200).json(updatedDocumentPersonne);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Supprimer une entrée
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.documentPersonneService.deleteDocumentPersonne(id);
      res.status(204).send();
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer toutes les personnes/fonctions liées à un document donné
  async findByDocumentId(req: Request, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.documentId, 10);
      const result = await this.documentPersonneService.documentPersonnesByDocumentId(documentId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
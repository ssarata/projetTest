import { Request, Response } from 'express';
import { Variable } from '@prisma/client';
import VariableService from '../Services/Variable.service';
import {
  HTTP_200_OK,
  HTTP_201_CREATE,
  HTTP_500_INTERNAL_SERVER_ERROR,
  HTTP_404_NOT_FOUND,
} from '../Constantes/httpStatus';
import VariableValidate from '../Validations/VariableValidate';

export class VariableController {
  private variableService: VariableService;

  constructor() {
    this.variableService = new VariableService();
  }

  // Créer une nouvelle variable
  async create(req: Request, res: Response): Promise<void> {
    const data = req.body;
    console.log('data', data);
    

    try {
      const result = VariableValidate(data);
      result.nomVariable = data.nomVariable;

const variable = await this.variableService.createVariable(result as Omit<Variable, 'id'>);      res.status(HTTP_201_CREATE).json(variable);
    } catch (error: any) {
      console.error(error);
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Récupérer toutes les variables
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const variables = await this.variableService.getAllVariables();
      res.status(HTTP_200_OK).json(variables);
    } catch (error: any) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Récupérer une variable par ID
  async findByID(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    try {
      const variable = await this.variableService.getVariableById(id);
      if (!variable) {
        res.status(HTTP_404_NOT_FOUND).json({ error: 'Variable non trouvée' });
        return;
      }
      res.status(HTTP_200_OK).json(variable);
    } catch (error: any) {
      res
        .status(HTTP_500_INTERNAL_SERVER_ERROR)
        .json({ error: 'Erreur lors de la récupération de la variable' });
    }
  }

  // Mettre à jour une variable
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    try {
      const result = VariableValidate(data);
      result.nomVariable = data.nomVariable;

      const variable = await this.variableService.updateVariable(id, result);
      res.status(HTTP_200_OK).json(variable);
    } catch (error: any) {
      res.status(HTTP_500_INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  // Supprimer une variable
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    try {
      await this.variableService.deleteVariable(id);
      res.status(204).send(); // Pas de contenu, suppression réussie
    } catch (error: any) {
      res
        .status(HTTP_500_INTERNAL_SERVER_ERROR)
        .json({ error: 'Erreur lors de la suppression de la variable' });
    }
  }

  // Récupérer les variables liées à un template
  async findByTemplate(req: Request, res: Response): Promise<void> {
    const templateId = parseInt(req.params.templateId, 10);
    try {
      const variables = await this.variableService.getVariablesByTemplate(templateId);
      res.status(HTTP_200_OK).json(variables);
    } catch (error: any) {
      res
        .status(HTTP_500_INTERNAL_SERVER_ERROR)
        .json({ error: 'Erreur lors de la récupération des variables par template' });
    }
  }
}
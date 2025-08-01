// src/middlewares/ensureAdmin.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware'; // Assurez-vous que ce type est correctement défini et exporté

export const ensureAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next(); // L'utilisateur est admin, continuer
  } else {
    res.status(403).json({ message: 'Accès refusé. Seul un administrateur peut effectuer cette action.' });
  }
};

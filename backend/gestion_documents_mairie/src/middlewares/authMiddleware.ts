import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User as PrismaUser, Role } from '@prisma/client'; // Importer PrismaClient et User

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';

// Il est préférable d'instancier PrismaClient une seule fois et de l'exporter/importer
// ou de l'injecter, plutôt que de créer une nouvelle instance dans chaque middleware/service.
// Pour cet exemple, nous allons l'instancier ici. Dans une application plus grande,
// envisagez un module de base de données partagé.
const prisma = new PrismaClient();

// Étend l'objet Request pour inclure un utilisateur typé
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: Role; // Utiliser l'enum Role de Prisma
    // Vous pourriez aussi choisir d'attacher l'objet PrismaUser complet (sans le mot de passe)
    // user?: Omit<PrismaUser, 'password'>;
  };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 401 Unauthorized est plus approprié pour un token manquant
    res.status(401).json({ message: 'Accès non autorisé : token manquant.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (typeof decoded === 'object' && decoded.userId) {
      // Récupérer l'utilisateur depuis la base de données pour vérifier son statut actuel
      const userFromDb = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!userFromDb) {
        res.status(403).json({ message: 'Accès refusé : Utilisateur du token non trouvé.' });
        return;
      }

      // Vérification cruciale : l'utilisateur est-il archivé ?
      if (userFromDb.isArchived) {
        res.status(403).json({ message: 'Accès refusé : Votre compte est archivé.' });
        return;
      }

      // Attacher les informations utilisateur à la requête (données fraîches de la DB)
      req.user = { // S'assurer que les champs correspondent à votre définition de AuthenticatedRequest
        userId: userFromDb.id,
        email: userFromDb.email,
        role: userFromDb.role, // Le rôle doit venir de la base de données
      };
      next();
    } else {
      res.status(401).json({ message: 'Token invalide : contenu incorrect' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
    // Vous pourriez vouloir une gestion d'erreur plus fine ici, par exemple :
    // if (err instanceof jwt.TokenExpiredError) {
    //   res.status(401).json({ message: 'Token expiré.' });
    // } else if (err instanceof jwt.JsonWebTokenError) {
    //   res.status(401).json({ message: 'Token invalide.' });
    // } else {
    //   res.status(500).json({ message: 'Erreur interne lors de la vérification du token.' });
    // }
  }
};

export default authenticateToken;
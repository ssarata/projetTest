import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, Personne, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';
if (JWT_SECRET === 'votre_clé_secrète') {
  console.warn("Attention: JWT_SECRET utilise une valeur par défaut. Veuillez la configurer dans vos variables d'environnement pour la production.");
}

interface AuthResponse {
  token: string; 
  user: User & { personne?: Personne };
  
}

// Login
const login = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { personne: true },
  });

  if (!user) throw new Error('Utilisateur non trouvé');

  // Vérification si l'utilisateur est archivé
  if (user.isArchived) {
    throw new Error('Compte archivé. Veuillez contacter l\'administrateur.');
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) throw new Error('Mot de passe incorrect');

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role }, // Ajout du rôle dans le payload du token
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user };
};

// Register
const register = async (
  email: string,
  password: string,
  personneData: Partial<Personne>
): Promise<User & { personne?: Personne }> => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Un utilisateur avec cet email existe déjà');

  if (!personneData.nom || !personneData.prenom) {
    throw new Error('Les champs nom et prenom sont obligatoires');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Déterminer le rôle du nouvel utilisateur
  // Le tout premier utilisateur créé dans le système sera ADMIN.
  // Les suivants (créés via la route /register, qui est protégée par ensureAdmin)
  // auront le rôle par défaut (RESPONSABLE).
  const usersCount = await prisma.user.count();
  let assignedRole: Role;

  if (usersCount === 0) {
    assignedRole = Role.ADMIN;
  } else {
    assignedRole = Role.RESPONSABLE; // Ou laisser Prisma utiliser le @default du schéma
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: assignedRole, // Assigner le rôle déterminé
      personne: {
        create: { // Assurez-vous que personneData contient bien nom et prenom
          nom: personneData.nom,
          prenom: personneData.prenom,
          profession: personneData.profession,
          adresse: personneData.adresse,
          telephone: personneData.telephone,
        },
      },
    },
    include: { personne: true },
  });

  return user;
};

// Get user by ID
const getUserById = async (id: number): Promise<(User & { personne: Personne | null }) | null> => {
  return await prisma.user.findUnique({ where: { id }, include: { personne: true } });
};

// Update user

/**
 * Type pour les données de mise à jour de l'utilisateur.
 * Accepte les champs de profil et/ou de mot de passe.
 */
type UserUpdateData = {
  email?: string;
  nom?: string;
  prenom?: string;
  currentPassword?: string;
  newPassword?: string;
};

/**
 * Met à jour un utilisateur et/ou sa personne associée.
 * Gère la mise à jour du profil et le changement de mot de passe de manière sécurisée.
 *
 * @param userId - L'ID de l'utilisateur à mettre à jour (doit être un string).
 * @param data - Les données à mettre à jour.
 * @returns L'objet utilisateur mis à jour avec sa personne.
 */
const updateUser = async ( // Changé en `const` pour être exporté par défaut à la fin
  userId: number, // Changed from string to number for consistency with controller
  data: UserUpdateData
): Promise<User & { personne: Personne | null }> => {
  const { currentPassword, newPassword, email, nom, prenom } = data;

  const updatePayload: any = {};
  const personneUpdatePayload: any = {};

  // --- 1. GESTION DU CHANGEMENT DE MOT DE PASSE ---
  // S'exécute uniquement si les deux champs de mot de passe sont fournis.
  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } }); // userId is already a number
    if (!user) {
      // Lance une erreur si l'utilisateur n'est pas trouvé.
      throw new Error("USER_NOT_FOUND");
    }

    // Vérification sécurisée du mot de passe actuel.
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      // Lance une erreur si le mot de passe actuel est incorrect.
      throw new Error("INVALID_CURRENT_PASSWORD");
    }

    // Hachage du nouveau mot de passe avant de le sauvegarder.
    const salt = await bcrypt.genSalt(10);
    updatePayload.password = await bcrypt.hash(newPassword, salt);
  }

  // --- 2. GESTION DE LA MISE À JOUR DU PROFIL ---
  if (email) {
    updatePayload.email = email;
  }
  if (nom) {
    personneUpdatePayload.nom = nom;
  }
  if (prenom) {
    personneUpdatePayload.prenom = prenom;
  }

  // Structure correctement les données pour la mise à jour imbriquée de la table `Personne`.
  if (Object.keys(personneUpdatePayload).length > 0) {
    updatePayload.personne = {
      update: personneUpdatePayload,
    };
  }

  // --- 3. VÉRIFICATION ET EXÉCUTION ---
  // S'assure qu'il y a bien des données à mettre à jour pour éviter un appel inutile.
  if (Object.keys(updatePayload).length === 0) {
    throw new Error("NO_UPDATE_DATA_PROVIDED");
  }

  // Exécute la mise à jour dans la base de données.
  const updatedUser = await prisma.user.update({
    where: { id: userId }, // userId is already a number
    data: updatePayload,
    include: {
      personne: true, // On inclut toujours les données de la personne dans la réponse.
    },
  });

  return updatedUser;
};


// Delete user (Hard delete - cette fonction est conservée si vous en avez l'usage direct ailleurs)
// Note: La route DELETE /auth/user/:id appelle `archiveUser` via `deleteUserController`.
// Pour la suppression définitive par un admin, une nouvelle fonction `permanentlyDeleteUserById` est ajoutée.
// const deleteUser = async (id: number): Promise<User> => {
//   // const intId = parseInt(id, 10); // id est déjà un nombre ici
//   // if (isNaN(intId)) {
//   //   throw new Error("ID invalide : ce n'est pas un nombre");
//   // }
//   return await prisma.user.delete({
//     where: {
//       id: id,
//     },
//   });
// };

// Archive user
const archiveUser = async (id: number): Promise<User & { personne?: Personne }> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { personne: true },
  });

  if (!user) {
    throw new Error(`Utilisateur avec l'ID ${id} non trouvé.`);
  }

  // Optionnel: Vérifier si l'utilisateur est déjà archivé pour éviter une mise à jour inutile
  if (user.isArchived) {
    console.warn(`L'utilisateur ${id} est déjà archivé.`);
    return user; // Ou throw new Error('Utilisateur déjà archivé');
  }

  return await prisma.user.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
    include: { personne: true },
  });
};

// Unarchive user
const unarchiveUser = async (id: number): Promise<User & { personne?: Personne }> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { personne: true },
  });

  if (!user) {
    throw new Error(`Utilisateur avec l'ID ${id} non trouvé.`);
  }

  // Optionnel: Vérifier si l'utilisateur n'est pas archivé
  if (!user.isArchived) {
    console.warn(`L'utilisateur ${id} n'est pas archivé.`);
    return user; // Ou throw new Error('Utilisateur non archivé');
  }

  return await prisma.user.update({
    where: { id },
    data: {
      isArchived: false,
      archivedAt: null,
    },
    include: { personne: true },
  });
};

// Get all users, with an option to filter by archived status
const getAllUsers = async (options?: { archived?: boolean }): Promise<(User & { personne?: Personne })[]> => {
  const whereClause: { isArchived?: boolean } = {};
  if (options?.archived === true) {
    whereClause.isArchived = true;
  } else if (options?.archived === false) {
    whereClause.isArchived = false;
  }
  // Si options.archived est undefined, aucun filtre sur isArchived n'est appliqué,
  // donc tous les utilisateurs (archivés et non archivés) seront retournés.
  // Si vous voulez explicitement ne retourner que les non-archivés par défaut,
  // vous pouvez ajuster la logique ici. Par exemple:
  // if (options?.archived === undefined) {
  //   whereClause.isArchived = false; // Par défaut, ne montrer que les actifs
  // }

  return await prisma.user.findMany({
    where: whereClause,
    include: { personne: true },
  });
};

// Permanently delete a user (intended for admin use, typically after archiving)
const permanentlyDeleteUserById = async (userId: number): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Optionnel : Vérifier si l'utilisateur est archivé avant suppression définitive
  // if (!user.isArchived) {
  //   throw new Error("L'utilisateur doit être archivé avant d'être supprimé définitivement.");
  // }

  // Avant de supprimer l'utilisateur, il faut gérer les relations.
  // Spécifiquement, la relation User-Personne où Personne.id est aussi User.id.
  // Il faut d'abord supprimer la Personne si la suppression de User ne la supprime pas en cascade (ce qui est le cas ici).
  // Cependant, votre schéma actuel `personne Personne @relation(fields: [id], references: [id])`
  // sur User et `user User?` sur Personne indique une relation 1-à-1 où l'ID de User est une FK vers Personne.id.
  // Cela signifie que Personne est l'entité principale. Supprimer User ne devrait pas poser de problème pour Personne.
  // Si la relation était inversée ou si des actions en cascade étaient définies différemment, il faudrait ajuster.
  await prisma.user.delete({
    where: { id: userId },
  });
};

export default {
  login,
  register,
  updateUser,
  getUserById,
  // deleteUser, // Commenté car la suppression "standard" est l'archivage. Remplacé par permanentlyDeleteUserById pour admin.
  archiveUser,
  unarchiveUser,
  getAllUsers,
  permanentlyDeleteUserById,
};

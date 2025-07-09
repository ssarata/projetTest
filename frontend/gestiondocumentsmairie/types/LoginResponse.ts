// types/LoginResponse.ts
export interface User {
  id: string;
  email: string;
  nom: string;
  password: string;
  prenom: string;
  archivedAt: string;
  role : Role;
  personne:{
    nom:string
    prenom: string
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    nom: string
    email: string
  }
}

enum Role {
  ADMIN,
  RESPONSABLE // Si vous utilisez ce rôle comme dans authMiddleware
  // Ajoutez d'autres rôles si nécessaire
}

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

export enum Role {
  ADMIN = "ADMIN",
  RESPONSABLE = "RESPONSABLE"
  // Ajoutez d'autres rôles si nécessaire
}

import { Variable } from "./Variable";

export interface DocumentTemplate {
    id: number;
    typeDocument: string;
    content: string;
    variables: Variable[];
    documents: Document[];
}
export interface Document {
  id: number
  date: string
  identiteDuMaire?: string
  templateId?: number
  template?: DocumentTemplate
  personnes: Personne[]
  userId: number
  user: User
  archive: boolean
  dateArchivage?: string // string si tu reçois depuis API, sinon Date
  archiveParId?: number
  archivePar?: User
  documentPersonnes: DocumentPersonne[]
}

export interface Personne {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  profession?: string; // Nouveau champ ajouté
}
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  personne?: Personne; // Optional, to avoid circular reference
}

export interface DocumentPersonne {
  id: number;
  fonction: string;
  documentId: number;
  personneId: number;
  document?: Document; // Optional, to avoid circular reference
  personne?: Personne; // Optional, to avoid circular reference
}

import type { Personne } from "./personne";

/**
 * Représente les informations de la mairie.
 */
export interface MairieType {
  id?: number;
  commune?: string;
  region?: string;
  ville?: string;
  nomMaire?: string;
  prenomMaire?: string;
}

/**
 * Représente un document avec toutes ses relations.
 * C'est un type composite utilisé pour passer toutes les données nécessaires
 * à la génération d'un document.
 */
export interface DocumentType {
  documentId?: number;
  document?: {
    id?: number;
    date?: string;
    template?: {
      id?: number;
      typeDocument?: string;
      content?: string;
    };
  };
  documentPersonnes?: {
    fonction?: string;
    personne?: Personne;
  }[];
}
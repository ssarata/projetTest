export type Personne = {
  id: number;
  nom: string;
  prenom: string;
  profession?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  dateNaissance?: string | null;
  nationalite?: string | null;
  numeroCni?: string | null;
  sexe?: string | null;
  lieuNaissance?: string | null;
  archive: boolean;
  dateArchivage?: string | null;
  archiveParId?: number | null;
  documentPersonnes:string
};

// On importe axios pour faire des requêtes HTTP
import axios from "axios";
import { Personne } from "@/types/personne";

// L'URL de base de l'API backend
const API_BASE_URL = "http://localhost:3000/api/personnes";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// ➕ Intercepteur pour ajouter automatiquement le token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 💡 Service pour Personne
const personneService = {
  async getAll(): Promise<Personne[]> {
    try {
      const response = await apiClient.get<Personne[]>("");
      return response.data;
    } catch (error: any) {
      console.error("Erreur getAll :", getAxiosMessage(error));
      throw new Error("Erreur lors du chargement des personnes.");
    }
  },

  async getById(id: number): Promise<Personne> {
    try {
      const response = await apiClient.get<Personne>(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur getById :", getAxiosMessage(error));
      if (error?.response?.status === 403) {
        throw new Error("Accès interdit : vous n'avez pas les droits.");
      }
      throw new Error("Erreur lors de la récupération de la personne.");
    }
  },

  async create(data: Partial<Personne>): Promise<Personne> {
    try {
      const response = await apiClient.post<Personne>("/", data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur création :", getAxiosMessage(error));
      throw new Error("Erreur lors de la création de la personne.");
    }
  },

  async update(id: number, data: Partial<Personne>): Promise<Personne> {
    try {
      const response = await apiClient.put<Personne>(`/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur mise à jour :", getAxiosMessage(error));
      throw new Error("Erreur lors de la mise à jour de la personne.");
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error: any) {
      const message = getAxiosMessage(error);
      console.error(`Erreur suppression (id: ${id}) :`, message);
      throw new Error("Erreur lors de la suppression de la personne.");
    }
  },

  async archive(id: number, archiveParId: number): Promise<Personne> {
  try {
    const response = await apiClient.put<Personne>(`/${id}/archiver`, { archiveParId });
    return response.data;
  } catch (error: any) {
    console.error("Erreur archivage :", getAxiosMessage(error));
    throw new Error("Erreur lors de l'archivage de la personne.");
  }
 },


  async getArchives(): Promise<Personne[]> {
    try {
      const response = await apiClient.get<Personne[]>("/archives");
      return response.data;
    } catch (error: any) {
      console.error("Erreur getArchives :", getAxiosMessage(error));
      throw new Error("Erreur lors de la récupération des personnes archivées.");
    }
  },

  async restore(id: number, archiveParId: number): Promise<Personne> {
    try {
      const response = await apiClient.put<Personne>(`/${id}/restaurer`, { archiveParId });
      return response.data;
    } catch (error: any) {
      console.error("Erreur restauration :", getAxiosMessage(error));
      throw new Error("Erreur lors de la restauration de la personne.");
    }
  },
};

// 🔧 Fonction utilitaire pour lire les messages d’erreur d’Axios proprement
function getAxiosMessage(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Erreur Axios inconnue.";
  }
  return error instanceof Error ? error.message : "Erreur inconnue.";
}

export default personneService;

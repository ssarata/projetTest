import axios from "axios";
import { Personne } from "@/types/personne";

const API_BASE_URL = "http://localhost:3000/api/personnes";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token dans les headers côté client uniquement
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

const personneService = {
  async getAll(): Promise<Personne[]> {
    try {
      const response = await apiClient.get<Personne[]>("");
      return response.data;
    } catch (error: any) {
      console.error("Erreur Axios complète getAll :", error);
      if (error?.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      throw new Error(
        error?.response?.data?.message || "Erreur lors du chargement des personnes."
      );
    }
  },

  async getById(id: number): Promise<Personne> {
    try {
      const response = await apiClient.get<Personne>(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur Axios complète getById :", error);
      if (error?.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        if (error.response.status === 403) {
          throw new Error("Accès interdit : vous n'avez pas les droits pour voir cette personne.");
        }
      }
      throw new Error(
        error?.response?.data?.message || "Erreur lors de la récupération de la personne."
      );
    }
  },

  async create(data: Partial<Personne>): Promise<Personne> {
    try {
      const response = await apiClient.post<Personne>("/", data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur création :", error?.response?.data || error.message);
      throw new Error(
        error?.response?.data?.message || "Erreur lors de la création de la personne."
      );
    }
  },

  async update(id: number, data: Partial<Personne>): Promise<Personne> {
    try {
      const response = await apiClient.put<Personne>(`/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur mise à jour :", error?.response?.data || error.message);
      throw new Error(
        error?.response?.data?.message || "Erreur lors de la mise à jour de la personne."
      );
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error: any) {
      console.error("Erreur suppression :", error?.response?.data || error.message);
      throw new Error(
        error?.response?.data?.message || "Erreur lors de la suppression de la personne."
      );
    }
  },
};

export default personneService;

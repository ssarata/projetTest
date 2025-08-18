// services/userService.ts

import axios, { AxiosError } from "axios";
import { User, LoginResponse } from "@/types/LoginResponse";
import { Personne } from "@/types/personne"; // Correction du chemin d'importation et utilisation d'un import nommé

const API_BASE_URL = "http://localhost:3000/auth";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token dans les headers côté client uniquement
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {}; // Assure que config.headers existe
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fonction d'assistance pour gérer les erreurs API Axios
export function handleApiServiceError(error: any, defaultErrorMessage: string): Error {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // L'API a répondu avec un statut d'erreur (4xx, 5xx)
      const apiError = error.response.data;
      const message = apiError?.message || apiError?.error || (typeof apiError === 'string' ? apiError : null);
      if (message) {
        return new Error(message);
      }
      return new Error(`Erreur ${error.response.status}: ${error.response.statusText || defaultErrorMessage}`);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return new Error("Erreur de réseau ou le serveur n'a pas répondu. Vérifiez votre connexion.");
    }
  }
  // Erreur lors de la configuration de la requête ou autre erreur non-Axios
  return new Error(error.message || defaultErrorMessage);
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Échec lors du chargement des utilisateurs.");
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/user/${userId}`);
    const userData = response.data;

    // Optionnel : vérifier que personne existe, sinon lever une erreur
    // Cette vérification est spécifique à la logique métier client
    if (!userData.personne) {
      throw new Error("Données de la personne manquantes dans l'utilisateur.");
    }
    return userData;
  } catch (error: any) {
    // Si l'erreur est celle que nous avons explicitement lancée ci-dessus, la relancer telle quelle.
    if (error.message === "Données de la personne manquantes dans l'utilisateur.") {
      throw error;
    }
    throw handleApiServiceError(error, "Utilisateur introuvable ou erreur serveur.");
  }
};

export const archiveUser = async (id: string): Promise<User> => {
  try {
    // Assurez-vous que votre backend a un endpoint comme PATCH /auth/user/{userId}/archive
    const response = await apiClient.delete<User>(`/user/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de l'archivage de l'utilisateur.");
  }
};

export const restoreUser = async (userId: string): Promise<User> => {
  try {
    // Assurez-vous que votre backend a un endpoint comme PATCH /auth/user/{userId}/restore
    const response = await apiClient.patch<User>(`/user/${userId}/unarchive`);
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de la restauration de l'utilisateur.");
  }
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    // La réponse de l'API est attendue sous la forme { message: string, user: User }
    // ou une structure similaire contenant l'utilisateur mis à jour.
    const response = await apiClient.put<{ user: User }>(`/user/${id}`, userData);
    // On retourne uniquement l'objet utilisateur, comme attendu par les composants.
    return response.data.user;
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de la mise à jour de l'utilisateur.");
  }
};


export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/user/${id}/force-delete`);
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de la suppression de l'utilisateur.");
  }
};

// 🔐 LOGIN
export const login = async (credentials: {
  email: string
  password: string
}): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>("/login", credentials);
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de la connexion. Vérifiez vos identifiants.");
  }
};

// 📝 REGISTER
/**
 * Données requises pour l'inscription d'un nouvel utilisateur.
 * Le champ `personne` est optionnel et permet de lier ou créer des informations personnelles
 * lors de l'inscription.
 */
export interface RegisterPayload {
  email: string;
  password: string;
  // username: string; // Supprimé si le backend ne l'attend pas
  personne?: Partial<Personne>; // Utilise le type Personne importé
}

export const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>("/register", payload);
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Erreur lors de l'inscription. Veuillez réessayer.");
  }
};


export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/me");
    // console.log(response.data);
    
    return response.data;
  } catch (error) {
    throw handleApiServiceError(error, "Impossible de récupérer l'utilisateur courant.");
  }
};


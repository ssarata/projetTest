import axios from "axios";

export interface Mairie {
  id: number;
  ville: string;
  commune: string;
  logo: string;
  region: string;
  prefecture: string;
}

const API_BASE_URL = "http://localhost:3000/api/mairies"
 // Change selon ton backend

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// 🔒 Ajout du token avec une vérification de headers
apiClient.interceptors.request.use(
  (config) => {
    // Si un header d'autorisation est déjà présent (ex: appel côté serveur), on ne fait rien.
    if (config.headers?.Authorization) {
      return config;
    }

    // Sinon, si on est côté client, on essaie d'ajouter le token depuis le localStorage.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {}; // Assure que headers est défini
        config.headers.Authorization = `Bearer ${token}`; // Ajoute le token
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const mairieService = {
  async getAll(serverToken?: string): Promise<Mairie[]> {
    // Si un token est passé (appel serveur), on l'ajoute directement aux headers
    const config = serverToken
      ? { headers: { Authorization: `Bearer ${serverToken}` } }
      : {};
    const response = await apiClient.get<Mairie[]>("", config);
    return response.data;
  },

  async getById(id: number): Promise<Mairie> {
    const response = await apiClient.get<Mairie>(`/${id}`);
    return response.data;
  },

  async create(data: Omit<Mairie, "id">): Promise<Mairie> {
    const response = await apiClient.post<Mairie>("/", data);
    return response.data;
  },

  async update(id: number, data: Partial<Mairie> | FormData): Promise<Mairie> {
    const response = await apiClient.put<Mairie>(`${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/${id}`);
  },
};

export default mairieService;

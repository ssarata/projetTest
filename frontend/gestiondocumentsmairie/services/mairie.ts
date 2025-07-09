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
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {}; // Assure que headers est défini
      config.headers.Authorization = `Bearer ${token}`; // Ajoute le token
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const mairieService = {
  async getAll(): Promise<Mairie[]> {
    const response = await apiClient.get<Mairie[]>("");
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

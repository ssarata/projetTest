import axios from "axios"
import type { Personne } from "@/types/personne"

const API_BASE_URL = "http://localhost:3000/api/"

// Fonction utilitaire pour récupérer le token du localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || ""
  }
  return ""
}

export const getAllPersonnes = async () => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}personnes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const getPersonneById = async (id: number) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}personnes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  // Filtrer côté front pour ne garder que les documents non archivés
  if (response.data && response.data.documentPersonnes) {
    response.data.documentPersonnes = response.data.documentPersonnes.filter(
      (dp: any) => !dp.document?.archive
    );
  }
  return response;
}

export const createPersonne = async (data: Personne) => {
  const token = getAuthToken();
  const response = await axios.post(`${API_BASE_URL}personnes`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  return response.data // Retourne directement les données
}

export const updatePersonne = async (id: number, data: Partial<Personne>) => {
  const token = getAuthToken();
  const response = await axios.put(`${API_BASE_URL}personnes/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  return response
}

export const deletePersonne = async (id: number): Promise<void> => {
  const token = getAuthToken();
  await axios.delete(`${API_BASE_URL}personnes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

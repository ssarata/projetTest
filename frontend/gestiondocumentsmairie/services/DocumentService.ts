import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || ""
  }
  return ""
}

export const getPersonnes = async () => {
  const token = getAuthToken()
  const response = await axios.get(`${API_BASE_URL}personnes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const getDocumentsArchives = async () => {
  const token = getAuthToken()
  const response = await axios.get(`${API_BASE_URL}documents/archives`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}



// Archiver un document
export const archiverDocument = async (id: number) => {
  const token = getAuthToken()
  return await axios.put(`${API_BASE_URL}documents/${id}/archiver`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Désarchiver un document
export const desarchiverDocument = async (id: number) => {
  const token = getAuthToken()
  return await axios.put(`${API_BASE_URL}documents/${id}/desarchiver`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Supprimer définitivement un document
export const supprimerDefinitivementDocument = async (id: number) => {
  const token = getAuthToken()
  return await axios.delete(`${API_BASE_URL}documents/${id}/force`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}


export const createDocument = async (documentData: { templateId: number; personnes: number[] }) => {
  const token = getAuthToken()
  const response = await axios.post(`${API_BASE_URL}documents`, documentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getDocuments = async () => {
  const token = getAuthToken()
  const response = await axios.get(`${API_BASE_URL}documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const createDocumentPersonne = async (data: { fonction: string; documentId: number; personneId: number }) => {
  const token = getAuthToken()
  const response = await axios.post(`${API_BASE_URL}document-personnes`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteDocument = async (documentId: string) => {
  const token = getAuthToken()
  const response = await axios.delete(`${API_BASE_URL}documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateDocument = async (documentId: string, data: { templateId: string; personnes: string[] }) => {
  const token = getAuthToken()
  const response = await axios.put(`${API_BASE_URL}documents/${documentId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getDocumentById = async (documentId: Number) => {
  const token = getAuthToken()
  const response = await axios.get(`${API_BASE_URL}documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}



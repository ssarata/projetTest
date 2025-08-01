import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api/"

// Fonction utilitaire pour récupérer le token du localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || ""
  }
  return ""
}

export const archiveTemplate = async (id: string) => {
  const token = getAuthToken()
  try {
    const response = await axios.put(`${API_BASE_URL}templates/archiver/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      message: "Template archivé avec succès",
      data: response.data
    }
  } catch (error) {
    console.error("Erreur lors de l'archivage :", error)
    throw error
  }
}

export const restoreTemplate = async (id: string) => {
  const token = getAuthToken()
  try {
    const response = await axios.put(`${API_BASE_URL}templates/restaurer/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      message: "Template restauré avec succès",
      data: response.data
    }
  } catch (error) {
    console.error("Erreur lors de la restauration :", error)
    throw error
  }
}

//  Supprimer définitivement un template archivé
export const forceDeleteTemplate = async (id: string) => {
  const token = getAuthToken()
  try {
    const response = await axios.delete(`${API_BASE_URL}templates/${id}/force`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return {
      success: true,
      message: "Template supprimé définitivement",
      data: response.data
    }
  } catch (error) {
    console.error("Erreur lors de la suppression définitive du template :", error)
    throw error
  }
}

//  Récupérer les templates archivés
export const getArchivedTemplates = async () => {
  const token = getAuthToken()
  try {
    const response = await axios.get(`${API_BASE_URL}templates/archives`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des templates archivés :", error)
    throw error
  }
}

export const createTemplate = async (templateData: { typeDocument: string; content: string }) => {
  const token = getAuthToken()
  try {
    const response = await axios.post(
      `${API_BASE_URL}templates`,
      templateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response
  } catch (error) {
    throw "erreur lors de la création du template"
  }
}

export const getTemplates = async () => {
  const token = getAuthToken()
  try {
    const response = await axios.get(`${API_BASE_URL}templates`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      
    })
          console.log(response.data);

    return response.data
  } catch (error) {
    throw "erreur lors de la récupération des templates"
  }
}

export const typeDocumentUnique = async (typeDocument: string): Promise<boolean> => {
  const token = getAuthToken()
  try {
    const response = await axios.get<{ isUnique: boolean }>(
      `${API_BASE_URL}templates/${typeDocument}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.isUnique
  } catch (error: any) {
    if (error.response?.status === 404) {
      return true // Si le serveur retourne 404, le type est unique
    }
    throw error
  }
}


export const checkTypeDocumentUnique = async (typeDocument: string): Promise<boolean> => {
  const token = getAuthToken()
  try {
    const response = await axios.get<{ isUnique: boolean }>(
      `${API_BASE_URL}templates/${typeDocument}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    console.log(response.data)
    return response.data.isUnique
  } catch (error: any) {
    if (error.response?.status === 404) {
      return true // Si le serveur retourne 404, le type est unique
    }
    console.error("Erreur lors de la vérification de l'unicité du type de document:", error)
    throw error
  }
}


export const getTemplateById = async (id: string) => {
  const token = getAuthToken()
  try {
    const response = await axios.get(`${API_BASE_URL}templates/get/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw "erreur lors de la récupération du template"
  }
}

export const updateTemplate = async (id: string, templateData: { typeDocument: string; content: string }) => {
  const token = getAuthToken()
  try {
    const response = await axios.put(`${API_BASE_URL}templates/${id}`, templateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response
  } catch (error) {
    throw "zerreur lors de la mise à jour du template"
  }
}

export const deleteTemplate = async (id: string) => {
  const token = getAuthToken()
  try {
    const response = await axios.delete(`${API_BASE_URL}templates/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw "erreur lors de la suppression du template"
  }
}

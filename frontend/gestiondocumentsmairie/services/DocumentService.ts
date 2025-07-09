import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || ""
  }
  return ""
}
  const token = getAuthToken()

export const getPersonnes = async () => {
  const response = await axios.get(`${API_BASE_URL}personnes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const getDocumentsArchives = async () => {
  const response = await axios.get(`${API_BASE_URL}documents/archives`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}



// Archiver un document
export const archiverDocument = async (id: number) => {
  return await axios.put(`${API_BASE_URL}documents/${id}/archiver`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Désarchiver un document
export const desarchiverDocument = async (id: number) => {
  return await axios.put(`${API_BASE_URL}documents/${id}/desarchiver`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Supprimer définitivement un document
export const supprimerDefinitivementDocument = async (id: number) => {
  return await axios.delete(`${API_BASE_URL}documents/${id}/force`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}


export const createDocument = async (documentData: { templateId: string; personnes: string[] }) => {
  const response = await axios.post(`${API_BASE_URL}documents`, documentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getDocuments = async () => {
  const response = await axios.get(`${API_BASE_URL}documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const createDocumentPersonne = async (data: { fonction: string; documentId: string; personneId: string }) => {
  const response = await axios.post(`${API_BASE_URL}document-personnes`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteDocument = async (documentId: string) => {
  const response = await axios.delete(`${API_BASE_URL}documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateDocument = async (documentId: string, data: { templateId: string; personnes: string[] }) => {
  const response = await axios.put(`${API_BASE_URL}documents/${documentId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getDocumentById = async (documentId: Number) => {
  const response = await axios.get(`${API_BASE_URL}documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}


// export async function generatePDF(doc: Document) {
//   try {
//     // Créer une nouvelle instance de jsPDF
//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     })

//     // Définir les marges et dimensions
//     const pageWidth = pdf.internal.pageSize.getWidth()
//     const pageHeight = pdf.internal.pageSize.getHeight()
//     const margin = 20
//     const contentWidth = pageWidth - margin * 2

//     // Couleurs officielles
//     const primaryColor = [41, 98, 255] // Bleu institutionnel
//     const secondaryColor = [100, 116, 139] // Gris
//     const textColor = [30, 41, 59] // Noir doux

//     // === EN-TÊTE OFFICIEL ===
//     // Rectangle de fond pour l'en-tête
//     pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
//     pdf.rect(0, 0, pageWidth, 35, "F")

//     // Logo de la République (simulé avec du texte)
//     pdf.setTextColor(255, 255, 255)
//     pdf.setFontSize(12)
//     pdf.setFont("helvetica", "bold")
//     pdf.text("RÉPUBLIQUE FRANÇAISE", margin, 15)
//     pdf.setFontSize(10)
//     pdf.setFont("helvetica", "normal")
//     pdf.text("Liberté • Égalité • Fraternité", margin, 22)

//     // Informations de la mairie (côté droit)
//     pdf.setFontSize(10)
//     pdf.setFont("helvetica", "bold")
//     const mairieInfo = ["MAIRIE DE [VILLE]", "Service État Civil", `Tél: 01.23.45.67.89`]

//     let yPos = 12
//     mairieInfo.forEach((info) => {
//       const textWidth = pdf.getTextWidth(info)
//       pdf.text(info, pageWidth - margin - textWidth, yPos)
//       yPos += 5
//     })

//     // === TITRE DU DOCUMENT ===
//     let currentY = 50
//     pdf.setTextColor(textColor[0], textColor[1], textColor[2])
//     pdf.setFontSize(18)
//     pdf.setFont("helvetica", "bold")
//     const title = doc.template?.typeDocument || "DOCUMENT OFFICIEL"
//     const titleWidth = pdf.getTextWidth(title)
//     pdf.text(title, (pageWidth - titleWidth) / 2, currentY)

//     // Ligne de séparation
//     currentY += 10
//     pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
//     pdf.setLineWidth(0.5)
//     pdf.line(margin, currentY, pageWidth - margin, currentY)

//     // Date et numéro
//     const documentDate = new Date(doc.date).toLocaleDateString("fr-FR", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     })

//     const docInfo = [
//       `Document N° : ${doc.id}`,
//       `Date d'établissement : ${documentDate}`,
//       `Établi par : ${doc.user?.username || "Service Municipal"}`,
//     ]

//     docInfo.forEach((info) => {
//       pdf.text(info, margin, currentY)
//       currentY += 6
//     })

  
//     // === CONTENU PRINCIPAL ===
//     pdf.setFontSize(12)
//     pdf.setFont("helvetica", "bold")
//     pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
//     pdf.text("CONTENU DU DOCUMENT", margin, currentY)

//     currentY += 10
//     pdf.setFontSize(11)
//     pdf.setFont("helvetica", "normal")
//     pdf.setTextColor(textColor[0], textColor[1], textColor[2])

//     // Traitement du contenu avec remplacement des variables
//     let content = doc.template?.content || "Contenu non disponible"

//     // Remplacer les variables par les données des personnes
//     if (doc.personnes && doc.personnes.length > 0) {
//       const mainPerson = doc.personnes[0] // Première personne comme référence principale

//       // Remplacements courants
//       const replacements: { [key: string]: string } = {
//         "{{nom}}": mainPerson.nom || "",
//         "{{prenom}}": mainPerson.prenom || "",
//         "{{nomComplet}}": `${mainPerson.prenom} ${mainPerson.nom}`,
//         "{{email}}": mainPerson.email || "",
//         "{{telephone}}": mainPerson.telephone || "",
//         "{{adresse}}": mainPerson.adresse || "",
//         "{{dateNaissance}}": mainPerson.dateNaissance
//           ? new Date(mainPerson.dateNaissance).toLocaleDateString("fr-FR")
//           : "",
//         "{{lieuNaissance}}": mainPerson.lieuNaissance || "",
//         "{{nationalite}}": mainPerson.nationalite || "",
//         "{{date}}": documentDate,
//         "{{numeroDocument}}": doc.id.toString(),
//       }

//       // Appliquer les remplacements
//       Object.entries(replacements).forEach(([placeholder, value]) => {
//         content = content.replace(new RegExp(placeholder, "g"), value)
//       })
//     }

//     // Diviser le contenu en lignes pour éviter les débordements
//     const contentLines = pdf.splitTextToSize(content, contentWidth)

//     // Vérifier si on a assez de place, sinon ajouter une nouvelle page
//     const lineHeight = 6
//     const requiredHeight = contentLines.length * lineHeight

//     if (currentY + requiredHeight > pageHeight - 40) {
//       pdf.addPage()
//       currentY = 30
//     }

//     pdf.text(contentLines, margin, currentY)
//     currentY += requiredHeight + 20

    
    
//     // Cadre pour signature
    
//     // === PIED DE PAGE ===
//     const footerY = pageHeight - 15
//     pdf.setFontSize(8)
//     pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
//     pdf.setFont("helvetica", "italic")

//     const footerText = `Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`
//     const footerWidth = pdf.getTextWidth(footerText)
//     pdf.text(footerText, (pageWidth - footerWidth) / 2, footerY)

  
//     // Télécharger le PDF avec un nom descriptif
//     const fileName = `${doc.template?.typeDocument?.replace(/\s+/g, "_") || "document"}_${doc.id}_${new Date().toISOString().split("T")[0]}.pdf`
//     pdf.save(fileName)

//     return true
//   } catch (error) {
//     console.error("Erreur lors de la génération du PDF:", error)
//     throw new Error("Impossible de générer le PDF. Veuillez réessayer.")
//   }
// }
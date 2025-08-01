'use client'

import { useEffect, useState } from "react"
import {
  getDocumentsArchives,
  desarchiverDocument,
  supprimerDefinitivementDocument
} from "@/services/DocumentService"
import type { Document } from "@/types/DocumentTemplate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Undo } from "lucide-react"

export default function DocumentsArchivesPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchArchives = async () => {
    setLoading(true)
    try {
      const response = await getDocumentsArchives()
      setDocuments(response.data)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDesarchiver = async (id: number) => {
    const confirmed = confirm("Voulez-vous vraiment désarchiver ce document ?")
    if (!confirmed) return

    try {
      await desarchiverDocument(id)
      fetchArchives()
    } catch (error) {
      console.error("Erreur lors de la désarchivage :", error)
      alert("Une erreur est survenue lors de la désarchivage.")
    }
  }

  const handleSuppression = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer définitivement ce document ?")) {
      try {
        await supprimerDefinitivementDocument(id)
        fetchArchives()
      } catch (error) {
        console.error("Erreur lors de la suppression :", error)
        alert("Une erreur est survenue lors de la suppression.")
      }
    }
  }

  useEffect(() => {
    fetchArchives()
  }, [])

  // Sécurise l'accès à documents pour éviter l'erreur si undefined
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const filteredDocuments = safeDocuments.filter((doc) =>
    doc.template?.typeDocument?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800">📁 Documents Archivés</h1>

      <Input
        placeholder="🔍 Rechercher par type de document..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/2"
      />

      {loading ? (
        <p className="text-gray-500">Chargement des documents...</p>
      ) : filteredDocuments.length === 0 ? (
        <p className="text-gray-500">Aucun document archivé trouvé.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-5 shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition duration-200"
            >
              <div className="mb-4 space-y-1">
                <p className="text-lg font-semibold text-gray-800">{doc.template?.typeDocument}</p>
                <p className="text-sm text-gray-600">🗓️ Créé le : {new Date(doc.date).toLocaleDateString("fr-FR")}</p>
                <p className="text-sm text-gray-600">
                  👤 Créé par :{" "}
                  {doc.user?.personne
                    ? `${doc.user.personne.prenom} ${doc.user.personne.nom}`
                    : "Inconnu"}
                </p>
              </div>

              <div className="mb-4 border-t pt-3 space-y-1 text-sm text-gray-700">
                <p className="font-semibold text-blue-700">🔒 Informations d’archivage :</p>
                <p>
                 Archivé le :{" "}
                  {doc.dateArchivage
                    ? new Date(doc.dateArchivage).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
                <p>
                  Archivé par :{" "}
                  {doc.archivePar?.personne
                    ? `${doc.archivePar.personne.prenom} ${doc.archivePar.personne.nom}`
                    : "—"}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => handleDesarchiver(doc.id)}>
                  <Undo className="w-4 h-4 mr-2" />
                  Désarchiver
                </Button>
                <Button variant="destructive" onClick={() => handleSuppression(doc.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
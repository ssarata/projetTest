"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTemplateById, deleteTemplate } from "@/services/DocumentTemplateService"
import { fetchVariables } from "@/services/VariableService"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DocumentTemplate } from "@/types/DocumentTemplate"

const TemplateDetailsPage: React.FC = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [template, setTemplate] = useState<DocumentTemplate | null>(null)
  const [allVariables, setAllVariables] = useState<{ id: string; nomVariable: string }[]>([])

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        const data = await getTemplateById(id)
        setTemplate(data as DocumentTemplate)
      }
    }

    fetchTemplate()
  }, [id])

  useEffect(() => {
    const fetchAllVariables = async () => {
      try {
        const data = await fetchVariables()
        setAllVariables(data)
      } catch (error) {
        setAllVariables([])
      }
    }
    fetchAllVariables()
  }, [])

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce template ?")
    if (!confirmDelete) return

    try {
      await deleteTemplate(id)
      router.push("/templates/index") // Redirige vers la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du template :", error)
    }
  }

  if (!template) {
    return <p className="text-center mt-10">Chargement du template...</p>
  }

  // Remplacement des ids de variables par les noms de variables dans le contenu
  const contentWithNomVariables = (() => {
    let content = template.content
    // Utilise la liste globale des variables pour la correspondance id -> nomVariable
    if (allVariables && Array.isArray(allVariables)) {
      for (const variable of allVariables) {
        content = content.replaceAll(`{{${variable.id}}}`, `{{${variable.nomVariable}}}`)
      }
    }
    return content
  })()

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-md">
        <CardContent>
          {/* En-tête structuré */}
          <div className="flex justify-between items-start mb-8">
            {/* Informations statiques à gauche */}
            <div className="text-left">
              <p className="font-bold">MINISTERE DE L’ADMINISTRATION TERRITORIALE</p>
              <p>DE LA DECENTRALISATION ET DU DEVELOPPEMENT</p>
              <p>DES TERRITOIRES</p>
              <p className="mt-4 font-bold">REGION CENTRALE</p>
              <p>COMMUNE DE TCHAOUDJO 1</p>
              <p className="mt-4">N° 4520 /CT1</p>
            </div>

            {/* Informations de la République Togolaise à droite */}
            <div className="text-right">
              <p className="font-bold">REPUBLIQUE TOGOLAISE</p>
              <p>Travail - Liberté - Patrie</p>
              <div className="mt-4">
                <img
                    src="/images/logo.png"
                    alt="Logo de la Mairie"
                    className="h-12 w-auto"
                />
              </div>
            </div>
          </div>

          {/* Type de document centré */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">{template.typeDocument}</h1>
          </div>

          {/* Contenu du document */}
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <p className="whitespace-pre-line">{contentWithNomVariables}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push(`/templates/edit/${id}`)}>
            Modifier
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default TemplateDetailsPage

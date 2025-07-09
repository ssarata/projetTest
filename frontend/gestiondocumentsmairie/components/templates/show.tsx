"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getTemplateById } from "@/services/DocumentTemplateService"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DocumentTemplate } from "@/types/DocumentTemplate"
import mairieService, { Mairie } from "@/services/mairie"
import { Building2 } from "lucide-react"

const TemplateDetailsPage: React.FC = () => {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [template, setTemplate] = useState<DocumentTemplate | null>(null)
  const [mairie, setMairie] = useState<Mairie | null>(null)
    const [mairieId, setMairieId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplate = async () => {
      if (id) {
        const data = await getTemplateById(id)
        setTemplate(data as DocumentTemplate)
      }
    }

    fetchTemplate()
  }, [id])

 const fetchMairie = async (showRefreshLoader = false) => {
      if (showRefreshLoader) setRefreshing(true)
      else setLoading(true)
  
      setError(null)
  
      try {
        const data = await mairieService.getAll()
        if (!data || data.length === 0) {
          setError("Aucune mairie trouvée dans le système.")
          setMairie(null)
          setMairieId(null)
        } else {
          setMairie(data[0])
          setMairieId(data[0].id)
        }
      } catch (err: any) {
        setError(err.message || "Échec de la récupération des données de la mairie.")
        console.error("Erreur API :", err)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }
      useEffect(() => {
        fetchMairie()
      }, [])


  if (!template) {
    return (
      <div className="container mx-auto py-10 px-4 text-center text-gray-500">
        Chargement du modèle...
      </div>
    );
  }
  if (!mairie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune mairie configurée</h3>
              <p className="text-slate-600 mb-6">
                Il semble qu'aucune mairie ne soit encore configurée dans le système.
              </p>
              
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
              <p className="mt-4 font-bold">REGION {mairie.region}</p>
              <p>COMMUNE DE {mairie.commune}</p>
              <p className="mt-4">N° {template.id} /CT1</p>
            </div>

            {/* Informations de la République Togolaise à droite */}
            <div className="text-right">
              <p className="font-bold">REPUBLIQUE TOGOLAISE</p>
              <p>Travail - Liberté - Patrie</p>
              <div className="mt-4">
                <img   
                    src={`http://localhost:3000/api/mairies/uploads/${mairie.logo}`}
                    alt={`Logo de la mairie de ${mairie.ville}`}
                    width={128}
                    height={128} />
              </div>
            </div>
          </div>

          {/* Type de document centré */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">{template.typeDocument}</h1>
          </div>

          {/* Contenu du document */}
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <p className="whitespace-pre-line">{template.content}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push(`/templates/edit/${id}`)}>
            Modifier
          </Button>
         
        </CardFooter>
      </Card>
    </div>
  )
}

export default TemplateDetailsPage

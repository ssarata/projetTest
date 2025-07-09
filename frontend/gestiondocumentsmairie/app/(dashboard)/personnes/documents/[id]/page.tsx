"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Eye, FileText, Calendar, User, ExternalLink, AlertCircle } from "lucide-react"
import * as personneService from "@/services/PersonneService"
import type { Personne } from "@/types/personne"

interface DocumentPersonne {
  id: number
  documentId: number
  personneId: number
  role: string
  document: {
    id: number
    titre?: string
    date: string
    template?: {
      typeDocument: string
      description?: string
    }
  }
}

export default function PersonneDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number.parseInt(params.id as string)

  const [personne, setPersonne] = useState<Personne | null>(null)
  const [documents, setDocuments] = useState<DocumentPersonne[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPersonneAndDocuments = async () => {
      if (!id || isNaN(id)) {
        setError("ID de personne invalide")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await personneService.getPersonneById(id)

        if (response && response.data) {
          setPersonne(response.data)
          // Les documents sont récupérés via la relation documentPersonnes
          setDocuments(response.data.documentPersonnes || [])
        } else {
          setError("Personne non trouvée")
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération:", err)
        setError("Erreur lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    fetchPersonneAndDocuments()
  }, [id])

  console.log(documents);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto py-10 px-4">
          <div className="mb-8">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !personne) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto py-10 px-4">
          <Card className="max-w-md mx-auto border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{error || "Personne non trouvée"}</h3>
              <p className="text-slate-600 mb-6">Impossible de charger les informations de cette personne.</p>
              <Button
                onClick={() => router.push("/personnes")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux personnes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                📄 Documents de {personne.prenom} {personne.nom}
              </h1>
              <p className="text-slate-600">
                {documents.length} document{documents.length !== 1 ? "s" : ""} trouvé{documents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/personnes")} className="hover:bg-slate-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux personnes
            </Button>
            <Link href={`/personnes/show/${personne.id}`}>
              <Button
                variant="outline"
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent"
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir la personne
              </Button>
            </Link>
          </div>
        </div>

        {/* Informations de la personne */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        
        </Card>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun document trouvé</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Cette personne n'est associée à aucun document pour le moment.
              </p>
              <Link href="/documents/nouveau">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Créer un document
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((docPersonne) => (
              docPersonne.document ? (
                <Card
                  key={docPersonne.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {docPersonne.document.template?.typeDocument || "Document sans titre"}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            {docPersonne.document.date
                              ? new Date(docPersonne.document.date).toLocaleDateString("fr-FR")
                              : "Date inconnue"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full flex-wrap">
                      <Link href={`/documents/${docPersonne.document.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ) : null
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

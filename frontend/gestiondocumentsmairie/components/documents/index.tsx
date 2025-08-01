"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Eye, Download, Plus, Search, Filter, Calendar,
  FileText, Users, TrendingUp, Delete
} from "lucide-react"
import {
   getDocuments, archiverDocument
} from "@/services/DocumentService"
import type { Document } from "@/types/DocumentTemplate"

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      try {
        const res = await getDocuments()
        if (res && res.data) {
          setDocuments(res.data)
        } else {
          console.error("Format de réponse inattendu:", res)
          setDocuments([])
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des documents:", error)
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleCreateClick = () => {
    router.push("/documents/nouveau")
  }

  const handleArchive = async (id: number) => {
  const confirmed = window.confirm("Voulez-vous vraiment archiver ce document ?")
  if (!confirmed) return

  try {
    const response = await archiverDocument(id)
    console.log("Réponse archivage:", response)

    setDocuments((docs) => docs.filter((d) => d.id !== id))
  } catch (err: any) {
    console.error("Erreur lors de l'archivage du document:", err)
    alert(`Une erreur est survenue lors de l'archivage: ${err.message || err}`)
  }
}



  const filteredDocuments = documents.filter((doc) =>
    doc.template?.typeDocument?.toLowerCase().includes(search.toLowerCase()),
  )

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.template?.typeDocument || "").localeCompare(b.template?.typeDocument || "")
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
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

  // Ajout d'une sécurité pour éviter l'accès à documents.length si documents est undefined
  if (!documents || !Array.isArray(documents)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Erreur lors du chargement des documents.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
          
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Liste des documents</h1>
            </div>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouveau Document
          </Button>
        </div>

        {/* Search / Filter */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un document..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
             
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {sortedDocuments.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {search ? "Aucun document trouvé" : "Aucun document créé"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {search
                  ? "Aucun document ne correspond à votre recherche."
                  : "Commencez par créer votre premier document administratif."}
              </p>
              <Button
                onClick={handleCreateClick}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                        <FileText className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {doc.template?.typeDocument || "Document sans titre"}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {doc.date ? new Date(doc.date).toLocaleDateString("fr-FR") : "Date non spécifiée"}
                        </div>
                      </div>
                    </div>
                   
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="space-y-3">
                   
                    <p className="text-sm text-slate-600">
                      Document généré automatiquement selon le modèle.
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full flex-wrap">
                    <Link href={`/documents/${doc.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700"
                      onClick={() => handleArchive(doc.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Archiver
                    </Button>
                    
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        
      </div>
    </div>
  )
}

function StatBox({ value, label, color }: { value: number, label: string, color: string }) {
  return (
    <div className={`text-center p-4 rounded-lg bg-gradient-to-r from-${color}-50 to-${color === "purple" ? "pink" : color}-50`}>
      <div className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getTemplates } from "@/services/DocumentTemplateService"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { DocumentTemplate } from "@/types/DocumentTemplate"
import { FileText, PlusCircle, Search, Edit, Filter, Eye, Archive } from "lucide-react"
import { archiveTemplate } from "@/services/DocumentTemplateService"

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const data = (await getTemplates()) as DocumentTemplate[]
        setTemplates(data)
      } catch (error) {
        console.error("Erreur lors du chargement des templates:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter((template) =>
    template.typeDocument.toLowerCase().includes(search.toLowerCase()),
  )

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.typeDocument.localeCompare(b.typeDocument)
      case "recent":
        return b.id - a.id
      default:
        return 0
    }
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Modèles de Documents</h1>
                  <p className="text-slate-600">Gérez vos modèles de documents administratifs</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/templates/create")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Nouveau Modèle
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un modèle..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-11">
                    <SelectValue />
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {sortedTemplates.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun modèle trouvé</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {search
                  ? "Aucun modèle ne correspond à votre recherche."
                  : "Commencez par créer votre premier modèle de document."}
              </p>
              <Button
                onClick={() => router.push("/templates/create")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer un modèle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedTemplates.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm flex flex-col h-full min-h-[180px] cursor-pointer"
                onClick={() => router.push(`/templates/show/${template.id}`)}
              >
                <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {template.typeDocument}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-0 pb-4 px-4 flex-shrink-0 mt-auto">
                  <div className="w-full space-y-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 bg-transparent text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/templates/show/${template.id}`)
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 bg-transparent text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/templates/edit/${template.id}`)
                        }}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 bg-transparent text-xs"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm("Voulez-vous vraiment archiver ce modèle ?")) {
                          try {
                            await archiveTemplate(template.id.toString())
                            setTemplates((prev) => prev.filter((t) => t.id !== template.id))
                          } catch (err) {
                            console.error("Erreur lors de l'archivage :", err)
                          }
                        }
                      }}
                    >
                      <Archive className="mr-1 h-3 w-3" />
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

export default TemplatesPage
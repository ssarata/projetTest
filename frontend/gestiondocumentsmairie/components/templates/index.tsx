"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getTemplates } from "@/services/DocumentTemplateService"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
       <h1>en cours de chargement...</h1>
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
                
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Liste de templates</h1>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/templates/create")}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {" "}
            {/* Adjusted grid columns */}
            {sortedTemplates.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm flex flex-col h-full cursor-pointer"
                onClick={() => router.push(`/templates/show/${template.id}`)}
              >
                <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {template.typeDocument}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow px-4 py-3 flex items-center justify-center">
                  <div className="relative w-full h-28 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 p-3 space-y-1.5 flex flex-col justify-center">
                      <div className="h-2.5 bg-blue-200 rounded-full w-10/12"></div>
                      <div className="h-2.5 bg-indigo-200 rounded-full w-9/12"></div>
                      <div className="h-2.5 bg-blue-200 rounded-full w-11/12"></div>
                      <div className="h-2.5 bg-indigo-200 rounded-full w-8/12"></div>
                    </div>
                    <FileText className="h-10 w-10 text-blue-400 opacity-20 absolute group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </CardContent>
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

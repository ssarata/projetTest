"use client"

import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import personneService from "@/services/api.personne"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Root, Body, Cell, Head, Header,Row } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Eye,
  Edit,
  Archive,
  Plus,
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { Personne } from "@/types/personne"

// 🔧 Fonction utilitaire pour formater le numéro local sans +228
function formatLocalPhone(phone?: string | null): string {
  if (!phone) return "—"
  const clean = phone.replace(/^\+228/, "").replace(/\D/g, "")
  return clean.replace(/(\d{2})(?=\d)/g, "$1-").slice(0, 11)
}

// 🔐 Récupère le userId à partir du token JWT
function getUserIdFromToken(): number {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Token non trouvé")
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.userId
  } catch (err) {
    throw new Error("Token invalide")
  }
}

type SortOption = "name" | "date" | "profession"

const ITEMS_PER_PAGE = 5

export default function PersonnesPage() {
  const [search, setSearch] = useState("")
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [professionFilter, setProfessionFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [archiveDialog, setArchiveDialog] = useState<{
    open: boolean
    personne: Personne | null
  }>({ open: false, personne: null })
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean
    title: string
    description: string
    type: "success" | "error"
  }>({ open: false, title: "", description: "", type: "success" })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Personne[] = await personneService.getAll()
        setPersonnes(data)
      } catch (error) {
        console.error("Erreur lors du chargement :", error)
        setFeedbackDialog({
          open: true,
          title: "Erreur",
          description: "Erreur lors du chargement des personnes.",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const professions = useMemo(() => {
    const uniqueProfessions = [...new Set(personnes.map((p) => p.profession).filter(Boolean))]
    return uniqueProfessions.sort()
  }, [personnes])

  const filteredAndSortedPersonnes = useMemo(() => {
    const filtered = personnes.filter((p) => {
      const matchesSearch =
        `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
        p.numeroCni?.toLowerCase().includes(search.toLowerCase()) ||
        p.telephone?.toLowerCase().includes(search.toLowerCase()) ||
        p.adresse?.toLowerCase().includes(search.toLowerCase())

      const matchesProfession = professionFilter === "all" || p.profession === professionFilter

      return matchesSearch && matchesProfession
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
        case "date":
          return new Date(b.dateNaissance || 0).getTime() - new Date(a.dateNaissance || 0).getTime()
        case "profession":
          return (a.profession || "").localeCompare(b.profession || "")
        default:
          return 0
      }
    })
  }, [personnes, search, sortBy, professionFilter])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPersonnes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPersonnes = filteredAndSortedPersonnes.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, professionFilter, sortBy])

  const handleArchive = async () => {
    if (!archiveDialog.personne) return

    try {
      const userId = getUserIdFromToken()
      await personneService.archive(archiveDialog.personne.id, userId)
      setPersonnes((prev) => prev.filter((p) => p.id !== archiveDialog.personne!.id))
      setFeedbackDialog({
        open: true,
        title: "Succès",
        description: `${archiveDialog.personne.prenom} ${archiveDialog.personne.nom} a été archivé(e).`,
        type: "success",
      })
    } catch (error: any) {
      setFeedbackDialog({
        open: true,
        title: "Erreur",
        description: error.message || "Erreur lors de l'archivage.",
        type: "error",
      })
    } finally {
      setArchiveDialog({ open: false, personne: null })
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Root>
          <Header>
            <Row>
              <Head>Nom</Head>
              <Head>Prénom</Head>
              <Head>Profession</Head>
              {/* <Head>Date de naissance</Head> */}
              <Head>Téléphone</Head>
              <Head>CNI</Head>
              <Head>Adresse</Head>
              <Head>Actions</Head>
            </Row>
          </Header>
          <Body>
            {[...Array(10)].map((_, i) => (
              <Row key={i}>
                <Cell>
                  <Skeleton className="h-4 w-20" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-20" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-16" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-24" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-20" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-16" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-32" />
                </Cell>
                <Cell>
                  <Skeleton className="h-4 w-20" />
                </Cell>
              </Row>
            ))}
          </Body>
        </Root>
      </div>
    </div>
  )

  if (loading)
    return (
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Liste des personnes
            </h1>
            <p className="text-gray-600 mt-1">Gérez votre base de données de personnes</p>
          </div>
        </div>
        <LoadingSkeleton />
      </main>
    )

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-600" />
            Liste des personnes
          </h1>
          <p className="text-gray-600 mt-1">Gérez votre base de données de personnes</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredAndSortedPersonnes.length} personne{filteredAndSortedPersonnes.length !== 1 ? "s" : ""}
          </Badge>
          <Button asChild>
            <Link href="/personnes/create">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, prénom, CNI, téléphone ou adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedPersonnes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Aucune personne trouvée</h3>
                  <p className="text-gray-600 mt-1">
                    {search || professionFilter !== "all"
                      ? "Aucun résultat pour vos critères de recherche."
                      : "Commencez par ajouter une personne."}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/personnes/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une personne
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Root>
                  <Header>
                    <Row>
                      <Head className="font-semibold">Nom</Head>
                      <Head className="font-semibold">Prénom</Head>
                      <Head className="font-semibold">Profession</Head>
                      {/* <Head className="font-semibold">Date de naissance</Head> */}
                      <Head className="font-semibold">Téléphone</Head>
                      <Head className="font-semibold">CNI</Head>
                      {/* <Head className="font-semibold">Adresse</Head> */}
                      <Head className="font-semibold text-center">Actions</Head>
                    </Row>
                  </Header>
                  <Body>
                    {currentPersonnes.map((personne) => (
                      <Row key={personne.id} className="hover:bg-gray-50">
                        <Cell className="font-medium">{personne.nom}</Cell>
                        <Cell>{personne.prenom}</Cell>
                        <Cell>
                          {personne.profession ? (
                            <Badge variant="secondary" className="text-xs">
                              {personne.profession}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </Cell>
                        {/* <Cell>
                          {personne.dateNaissance ? new Date(personne.dateNaissance).toLocaleDateString("fr-FR") : "—"}
                        </Cell> */}
                        <Cell className="font-mono text-sm">{formatLocalPhone(personne.telephone)}</Cell>
                        <Cell className="font-mono text-sm">{personne.numeroCni || "—"}</Cell>
                        {/* <Cell className="max-w-xs truncate" title={personne.adresse || ""}>
                          {personne.adresse || "—"}
                        </Cell> */}
                        <Cell>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="sm" asChild title="Voir les détails">
                              <Link href={`/personnes/show/${personne.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild title="Modifier">
                              <Link href={`/personnes/edit/${personne.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setArchiveDialog({ open: true, personne })}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </Cell>
                      </Row>
                    ))}
                  </Body>
                </Root>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-700">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAndSortedPersonnes.length)} sur{" "}
                    {filteredAndSortedPersonnes.length} résultat{filteredAndSortedPersonnes.length !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber
                        if (totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AlertDialog
        open={archiveDialog.open}
        onOpenChange={(open) => !open && setArchiveDialog({ open: false, personne: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-600">Archiver la personne</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment archiver "{archiveDialog.personne?.prenom} {archiveDialog.personne?.nom}" ? Cette
              personne sera déplacée vers les archives et ne sera plus visible dans la liste principale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-orange-600 hover:bg-orange-700">
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={feedbackDialog.type === "success" ? "text-green-600" : "text-red-600"}>
              {feedbackDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{feedbackDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}
              className={
                feedbackDialog.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

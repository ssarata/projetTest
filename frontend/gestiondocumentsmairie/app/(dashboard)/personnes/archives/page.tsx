"use client"

import { useEffect, useState, useMemo } from "react"
import type { Personne } from "@/types/personne"
import personneService from "@/services/api.personne"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Undo2, Search, Filter, Calendar, User, Phone, MapPin, CreditCard, Archive } from "lucide-react"
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

/** * 🔐 Récupère le userId à partir du token JWT */
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

type SortOption = "name" | "date" | "archiver"

export default function PersonnesArchivesPage() {
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("date")
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean
    title: string
    description: string
    type: "success" | "error" | "info"
  }>({
    open: false,
    title: "",
    description: "",
    type: "info",
  })
  const [personneToRestore, setPersonneToRestore] = useState<Personne | null>(null)
  const [personneToDelete, setPersonneToDelete] = useState<Personne | null>(null)

  const fetchArchives = async () => {
    setLoading(true)
    try {
      const data = await personneService.getArchives()
      setPersonnes(data)
    } catch (error) {
      setFeedbackDialog({
        open: true,
        title: "Erreur",
        description: "Erreur lors du chargement des personnes archivées.",
        type: "error",
      })
      console.error("Erreur lors du chargement des archives :", error)
    } finally {
      setLoading(false)
    }
  }

  const executeRestore = async () => {
    if (!personneToRestore) return
    setLoadingId(personneToRestore.id)
    try {
      const userId = getUserIdFromToken()
      await personneService.restore(personneToRestore.id, userId)
      await fetchArchives()
      setFeedbackDialog({
        open: true,
        title: "Succès",
        description: `La personne "${personneToRestore.prenom} ${personneToRestore.nom}" a été restaurée.`,
        type: "success",
      })
    } catch (error) {
      console.error("Erreur lors de la restauration :", error)
      setFeedbackDialog({
        open: true,
        title: "Erreur",
        description: "Une erreur est survenue lors de la restauration.",
        type: "error",
      })
    } finally {
      setLoadingId(null)
      setPersonneToRestore(null)
    }
  }

  const executeDelete = async () => {
    if (!personneToDelete) return
    setLoadingId(personneToDelete.id)
    try {
      const personne = await personneService.getById(personneToDelete.id)
      if (personne.documentPersonnes && personne.documentPersonnes.length > 0) {
        setFeedbackDialog({
          open: true,
          title: "Suppression impossible",
          description: "Impossible de supprimer cette personne, car elle est associée à un ou plusieurs documents.",
          type: "error",
        })
        return
      }
      await personneService.delete(personneToDelete.id)
      await fetchArchives()
      setFeedbackDialog({
        open: true,
        title: "Succès",
        description: "La personne a été supprimée définitivement.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Erreur lors de la suppression définitive :", error)
      setFeedbackDialog({
        open: true,
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression.",
        type: "error",
      })
    } finally {
      setLoadingId(null)
      setPersonneToDelete(null)
    }
  }

  useEffect(() => {
    fetchArchives()
  }, [])

  const filteredAndSortedPersonnes = useMemo(() => {
    const filtered = personnes.filter(
      (p) =>
        `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numeroCni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telephone?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)
        case "date":
          return new Date(b.dateArchivage || 0).getTime() - new Date(a.dateArchivage || 0).getTime()
        case "archiver":
          return (a.archiveParId || 0) - (b.archiveParId || 0)
        default:
          return 0
      }
    })
  }, [personnes, searchTerm, sortBy])

  const PersonneCard = ({ personne }: { personne: Personne }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {personne.prenom} {personne.nom}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 w-fit">
                <Archive className="w-3 h-3 mr-1" />
                Archivée
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              disabled={loadingId === personne.id}
              onClick={() => setPersonneToRestore(personne)}
              className="hover:bg-green-50 hover:border-green-300 flex-1 sm:flex-none"
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Restaurer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loadingId === personne.id}
              onClick={() => setPersonneToDelete(personne)}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {personne.adresse && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{personne.adresse}</span>
            </div>
          )}
          {personne.telephone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{personne.telephone}</span>
            </div>
          )}
          {personne.numeroCni && (
            <div className="flex items-center gap-2 text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>{personne.numeroCni}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Archivée le {personne.dateArchivage ? new Date(personne.dateArchivage).toLocaleDateString("fr-FR") : "—"}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Archivée par Utilisateur #{personne.archiveParId}</span>
        </div>
      </CardContent>
    </Card>
  )

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Archive className="w-8 h-8 text-blue-600" />
            Personnes Archivées
          </h1>
          <p className="text-gray-600 mt-1">Gérez les personnes archivées - restaurez ou supprimez définitivement</p>
        </div>
        <Badge variant="outline" className="w-fit">
          {filteredAndSortedPersonnes.length} personne{filteredAndSortedPersonnes.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, prénom, CNI ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date d'archivage</SelectItem>
            <SelectItem value="name">Nom alphabétique</SelectItem>
            <SelectItem value="archiver">Archivé par</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredAndSortedPersonnes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aucune personne archivée</h3>
              <p className="text-gray-600 mt-1">
                {searchTerm
                  ? "Aucun résultat pour votre recherche."
                  : "Il n'y a actuellement aucune personne archivée."}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPersonnes.map((personne) => (
            <PersonneCard key={personne.id} personne={personne} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AlertDialog open={feedbackDialog.open} onOpenChange={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              className={
                feedbackDialog.type === "success"
                  ? "text-green-600"
                  : feedbackDialog.type === "error"
                    ? "text-red-600"
                    : "text-blue-600"
              }
            >
              {feedbackDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>{feedbackDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}
              className={
                feedbackDialog.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : feedbackDialog.type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!personneToRestore} onOpenChange={(open) => !open && setPersonneToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Restaurer la personne</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment restaurer "{personneToRestore?.prenom} {personneToRestore?.nom}" ? Cette personne
              sera de nouveau accessible dans la liste principale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeRestore} className="bg-green-600 hover:bg-green-700">
              Restaurer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!personneToDelete} onOpenChange={(open) => !open && setPersonneToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Suppression définitive</AlertDialogTitle>
            <AlertDialogDescription>
              ⚠️ Cette action est irréversible. Voulez-vous vraiment supprimer définitivement "{personneToDelete?.prenom}{" "}
              {personneToDelete?.nom}" ? Toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={executeDelete}>
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

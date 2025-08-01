'use client'

import { useEffect, useState } from "react"
import {
  getArchivedTemplates,
  restoreTemplate,
  forceDeleteTemplate,
  getTemplateById
} from "@/services/DocumentTemplateService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Undo } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"

export default function ArchivedTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [alertDialog, setAlertDialog] = useState<{ open: boolean, title: string, description: string }>({ open: false, title: '', description: '' })
  const [templateToDelete, setTemplateToDelete] = useState<any | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await getArchivedTemplates()
      setTemplates(data)
    } catch (error) {
      setAlertDialog({ open: true, title: "Erreur", description: "Erreur lors du chargement des templates archivés." })
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreTemplate(id)
      await fetchTemplates()
      setAlertDialog({ open: true, title: "Succès", description: "Template restauré avec succès" })
    } catch {
      setAlertDialog({ open: true, title: "Erreur", description: "Échec de la restauration" })
    }
  }

  // Nouvelle logique : suppression après confirmation
  const confirmForceDelete = (template: any) => {
    setTemplateToDelete(template)
  }

  const handleForceDelete = async () => {
    if (!templateToDelete) return
    try {
      const template=await getTemplateById(templateToDelete.id)
      if (template.documents && template.documents.length > 0) {
        setAlertDialog({ open: true, title: "Suppression impossible", description:
          "Impossible de supprimer ce template : il est rattaché à au moins un document." })
        setTemplateToDelete(null)
        return
      }
      else{ const result = await forceDeleteTemplate(templateToDelete.id)
      if (result && result.success === false) {
        setAlertDialog({ open: true, title: "Suppression impossible", description: result.message || "Impossible de supprimer ce template : il est rattaché à au moins un document." })
        setTemplateToDelete(null)
        return
      }}
     
      await fetchTemplates()
      setAlertDialog({ open: true, title: "Succès", description: "Template supprimé définitivement" })
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg && msg.includes("rattaché à au moins un document")) {
        setAlertDialog({ open: true, title: "Suppression impossible", description: "Impossible de supprimer ce template : il est rattaché à au moins un document." })
      } else {
        setAlertDialog({ open: true, title: "Erreur serveur", description: "Erreur serveur lors de la suppression (code 500)" })
      }
    } finally {
      setTemplateToDelete(null)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter((tpl) =>
    tpl.typeDocument.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800">🗂️ Templates Archivés</h1>

      <Input
        placeholder="🔍 Rechercher un type de document..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/2"
      />

      {/* Dialog pour feedback (succès/erreur métier) */}
      <AlertDialog open={alertDialog.open} onOpenChange={open => setAlertDialog(a => ({ ...a, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog(a => ({ ...a, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation destructive */}
      <AlertDialog open={!!templateToDelete} onOpenChange={open => { if (!open) setTemplateToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suppression définitive</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Supprimer le template « {templateToDelete?.typeDocument} » ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleForceDelete}>
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading ? (
        <p className="text-gray-500">Chargement des templates...</p>
      ) : filteredTemplates.length === 0 ? (
        <p className="text-gray-500">Aucun template archivé trouvé.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-5 shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition duration-200"
            >
              <div className="mb-3 space-y-1">
                <p className="text-lg font-semibold text-gray-800">{template.typeDocument}</p>
                <p className="text-sm text-gray-600">🆔 ID : {template.id}</p>
                <p className="text-sm text-gray-600">
                  📅 Archivé le :{" "}
                  {template.dateArchivage
                    ? new Date(template.dateArchivage).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
                <p className="text-sm text-gray-600">
                  👤 Archivé par :{" "}
                  {template.archivePar?.personne
                    ? `${template.archivePar.personne.prenom} ${template.archivePar.personne.nom}`
                    : "—"}
                </p>
                <p className="text-xs italic text-gray-500">
                  Aperçu contenu : {template.content.slice(0, 60)}...
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => handleRestore(template.id)}>
                  <Undo className="w-4 h-4 mr-2" />
                  Restaurer
                </Button>
                <Button variant="destructive" onClick={() => confirmForceDelete(template)}>
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
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { getTemplates } from "@/services/DocumentTemplateService"
import { createDocumentPersonne } from "@/services/DocumentService"
import type { DocumentTemplate, Personne } from "@/types/DocumentTemplate"
import { FileText, Users, Plus, X, ArrowLeft, AlertCircle, CheckCircle, Save, Loader2 } from "lucide-react"
import PersonneForm from "../personnes/createForm"
import { getAllPersonnes } from "@/services/PersonneService"
import { fetchDocumentPersonnesByDocumentId } from "@/services/DocumentPersonneService"

export default function EditDocumentForm() {
  const [mounted, setMounted] = useState(false)
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({})
  const [personnes, setPersonnes] = useState<Personne[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [variableForModal, setVariableForModal] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const params = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const documentId = String(params.id)

  // Centralized data loading to prevent race conditions
  useEffect(() => {
    const loadInitialData = async () => {
      if (!documentId) return
      setIsLoading(true)
      try {
        // Fetch all necessary data in parallel
        const [templatesResponse, personnesResponse, docPersonnesData] = await Promise.all([
          getTemplates(),
          getAllPersonnes(),
          fetchDocumentPersonnesByDocumentId(Number(documentId)),
        ])

        const templatesData = (templatesResponse as DocumentTemplate[]) || []
        setTemplates(templatesData)
        setPersonnes(personnesResponse.data || [])

        // Process document data once everything is loaded
        if (docPersonnesData && docPersonnesData.length > 0) {
          const doc = docPersonnesData[0].document

          // Find and set the selected template
          const currentTemplate = templatesData.find((t) => t.id === doc.templateId)
          if (currentTemplate) {
            setSelectedTemplate(currentTemplate)
          } else {
            setAlert({ type: "error", message: "Le modèle de document original n'a pas été trouvé." })
          }

          // Pre-fill the variable values from all associated persons
          const initialValues = docPersonnesData.reduce((acc: { [key: string]: string }, docPerso: any) => {
            if (docPerso.fonction && docPerso.personneId) {
              acc[docPerso.fonction] = docPerso.personneId.toString()
            }
            return acc
          }, {})
          setVariableValues(initialValues)
        } else {
          setAlert({ type: "error", message: "Document non trouvé ou aucune personne associée." })
        }
      } catch (error) {
        console.error("Error loading data for edit form:", error)
        setAlert({ type: "error", message: "Erreur lors du chargement des données du document." })
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [documentId])

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchAllPersonnes = useCallback(async () => {
    try {
      const reponse = await getAllPersonnes()
      if (reponse.data) {
        setPersonnes(reponse.data)
      }
    } catch (err: any) {
      setPersonnes([])
      console.error("Failed to fetch personnes:", err)
    }
  }, [])

  useEffect(() => {
    fetchAllPersonnes()
  }, [fetchAllPersonnes])

  useEffect(() => {
    // Si aucun modèle (template) n'est sélectionné, on réinitialise tout et on sort
    if (!selectedTemplate) {
      setVariables([]) // On vide la liste des variables
      return // On quitte l'effet ici
    }

    try {
      // Définition d'une expression régulière pour capturer les variables de type {{nomVariable}}
      const regex = /{{(.*?)}}/g
      const vars: string[] = [] // Liste pour stocker les noms des variables trouvées
      let match

      // On parcourt toutes les correspondances dans le contenu du template
      while ((match = regex.exec(selectedTemplate.content)) !== null) {
        vars.push(match[1].trim()) // match[1] contient le nom de la variable sans les accolades
      }

      setVariables(vars) // On met à jour la liste des variables extraites
    } catch (error) {
      // En cas d'erreur (par exemple, contenu invalide), on réinitialise tout
      setVariables([])
    }
  }, [selectedTemplate]) // L'effet se déclenche à chaque fois que `selectedTemplate` change

  // Fonction appelée lorsqu'une variable est modifiée (sélection d'une personne existante)
  const changerValeurVariable = (variable: string, personneId: string) => {
    // Met à jour l'état des valeurs des variables (assigne une personne à une variable)
    setVariableValues((prev) => ({ ...prev, [variable]: personneId }))
  }

  // Fonction appelée lorsqu'on souhaite ajouter une nouvelle personne pour une variable donnée
  const ajouterNouvellePersonne = (variableName: string) => {
    // On garde en mémoire le nom de la variable concernée
    setVariableForModal(variableName)
    // On ouvre la modale de création de personne
    setIsModalOpen(true)
  }

  // Fonction appelée après la création d'une nouvelle personne depuis la modale
  const traiterNouvellePersonne = async (newPerson: any) => {
    // Ferme la modale
    setIsModalOpen(false)
    // Récupère la variable pour laquelle on a ouvert la modale
    const variableForRole = variableForModal
    // Recharge toutes les personnes pour mettre à jour la liste déroulante
    await fetchAllPersonnes()

    // Si une variable a bien été ciblée et qu'une nouvelle personne a un id valide
    if (variableForRole && newPerson.id) {
      // Associe automatiquement la nouvelle personne à la variable concernée
      setVariableValues((prev) => ({
        ...prev,
        [variableForRole]: newPerson.id.toString(), // stocké en string
      }))
      // Affiche un message de succès avec le nom de la personne et le rôle
      setAlert({
        type: "success",
        message: `${newPerson.prenom} ${newPerson.nom} a été créé(e) et sélectionné(e) pour le rôle "${variableForRole}"`,
      })
    } else {
      // Message de succès simple si pas de rôle ciblé
      setAlert({ type: "success", message: "Personne créée avec succès!" })
    }

    // Réinitialise la variable ciblée pour la prochaine fois
    setVariableForModal(null)
    // Supprime le message d'alerte après 4 secondes
    setTimeout(() => setAlert(null), 4000)
  }

  // Fonction appelée lors de la soumission du formulaire pour METTRE A JOUR le document
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault() // Empêche le rechargement de la page

    // Si aucun template sélectionné, afficher une erreur
    if (!selectedTemplate) {
      setAlert({ type: "error", message: "Veuillez sélectionner un modèle de document" })
      return
    }

    // Vérifie s'il manque des variables non remplies
    const missingVariables = variables.filter((v) => !variableValues[v])
    if (missingVariables.length > 0) {
      setAlert({ type: "error", message: "Veuillez remplir tous les champs requis" })
      return
    }

    try {
      // Indique que la soumission est en cours
      setIsSubmitting(true)
      setAlert(null) // Réinitialise les alertes

      const docId = Number(documentId)

      // 2. Créer les nouvelles associations pour chaque variable
      await Promise.all(
        variables
          .map((nomVariable) => {
            const personneIdStr = variableValues[nomVariable]
            if (!personneIdStr) return null // si pas de valeur, on ignore
            return createDocumentPersonne({
              fonction: nomVariable, // le nom de la variable (ex: directeur)
              documentId: docId, // ID du document existant
              personneId: Number(personneIdStr), // ID de la personne liée
            })
          })
          .filter(Boolean), // enlève les "null"
      )

      // Affiche un message de succès
      setAlert({ type: "success", message: "Document mis à jour avec succès!" })
      // Redirige vers la page de détails du document après 1.5 secondes
      setTimeout(() => {
        router.push(`/documents/${documentId}`)
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document :", error)
      setAlert({ type: "error", message: "Erreur lors de la mise à jour du document." })
    } finally {
      // Fin de la soumission
      setIsSubmitting(false)
    }
  }

  // Préparer les options pour les selects avec recherche
  const templateOptions = templates.map((template) => ({
    value: template.id?.toString() || "",
    label: template.typeDocument,
    icon: <FileText className="h-4 w-4" />,
  }))

  const personneOptions = personnes.map((personne) => ({
    value: personne.id.toString(),
    label: `${personne.prenom} ${personne.nom}`,
    icon: <Users className="h-4 w-4" />,
  }))

  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 space-y-8">
            <Skeleton className="h-12 w-full" />
            <Separator />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/documents")}
            className="mb-4 hover:bg-slate-50 border-slate-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux documents
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Modifier le document</h1>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            className={`mb-6 ${alert.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={alert.type === "success" ? "text-green-700" : "text-red-700"}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-8">
              {/* Template Selection - Disabled for editing */}
              <div className="space-y-3">
                <Label htmlFor="template" className="text-base font-semibold text-slate-900">
                  Modèle de document <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <SearchableSelect
                    value={selectedTemplate?.id?.toString() || ""}
                    onValueChange={() => {}} // On ne permet pas de changer de modèle
                    options={templateOptions}
                    placeholder="Sélectionnez un modèle de document"
                    searchPlaceholder="Rechercher un modèle..."
                    emptyMessage="Aucun modèle trouvé."
                    className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 opacity-60 cursor-not-allowed"
                  />
                  <div className="absolute inset-0 bg-transparent cursor-not-allowed" />
                  <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs">Non modifiable</Badge>
                </div>
              </div>

              {/* Variables Section */}
              {variables.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label className="text-lg font-semibold text-slate-900">Champs dynamiques</Label>
                        <p className="text-sm text-slate-600">Modifiez les personnes assignées aux différents rôles</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {variables.map((variable, index) => (
                        <Card
                          key={`${variable}-${index}`}
                          className="border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`${variable}-${index}`}
                                  className="font-medium text-slate-900 flex items-center gap-2"
                                >
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                    {index + 1}
                                  </div>
                                  {variable}
                                </Label>
                                <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                                  Requis
                                </Badge>
                              </div>

                              <div className="flex gap-3">
                                <div className="flex-1">
                                  <SearchableSelect
                                    value={variableValues[variable] || ""}
                                    onValueChange={(value) => changerValeurVariable(variable, value)}
                                    options={personneOptions}
                                    placeholder={`Sélectionnez ${variable.toLowerCase()}`}
                                    searchPlaceholder="Rechercher une personne..."
                                    emptyMessage="Aucune personne trouvée."
                                    className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => ajouterNouvellePersonne(variable)}
                                  className="whitespace-nowrap hover:bg-emerald-50 hover:border-emerald-200 border-2 border-dashed"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={!selectedTemplate || variables.some((v) => !variableValues[v]) || isSubmitting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 min-w-[200px] h-12"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modal pour créer une nouvelle personne */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Ajouter une nouvelle personne</h2>
                      <p className="text-blue-100 text-sm">
                        Pour le rôle: <span className="font-semibold text-white">{variableForModal}</span>
                      </p>
                      <p className="text-blue-200 text-xs mt-1">
                        Cette personne sera automatiquement sélectionnée après création
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false)
                      setVariableForModal(null)
                    }}
                    className="text-white hover:bg-white/20 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <PersonneForm
                  onPersonCreated={traiterNouvellePersonne}
                  onCancel={() => {
                    setIsModalOpen(false)
                    setVariableForModal(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

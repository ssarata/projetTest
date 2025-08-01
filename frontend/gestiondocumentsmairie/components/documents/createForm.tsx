"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { getTemplates } from "@/services/DocumentTemplateService"
import { createDocument, createDocumentPersonne } from "@/services/DocumentService"
import type { DocumentTemplate } from "@/types/DocumentTemplate"
import { FileText, Users, Plus, X, ArrowLeft, AlertCircle, CheckCircle, Sparkles } from "lucide-react"
import PersonneForm from "../personnes/createForm"
import { getAllPersonnes } from "@/services/PersonneService"

export default function CreateDocumentForm() {
  const [mounted, setMounted] = useState(false)
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({})
  const [personnes, setPersonnes] = useState<any[]>([])
  const [Modal, setModal] = useState(false)
  const [variableActivePourModal, setvariableActivePourModal] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function fetchAllPersonnes() {
    try {
      const reponse = await getAllPersonnes()
      setPersonnes(reponse.data)
      return reponse.data
    } catch (err: any) {
      setPersonnes([])
      return []
    }
  }

  useEffect(() => {
    fetchAllPersonnes()
  }, [])

  useEffect(() => {
    const listeTemplates = async () => {
      try {
        const data = await getTemplates()
        const templatAvecVariablesRemplacer = await Promise.all(
          (data as DocumentTemplate[]).map(async (template) => {
            const content = template.content
            return { ...template, content }
          }),
        )
        setTemplates(templatAvecVariablesRemplacer)
      } catch (error) {
        console.error("Erreur récupération templates :", error)
        setAlert({ type: "error", message: "Erreur lors du chargement des modèles" })
      }
    }
    listeTemplates()
  }, [])

  useEffect(() => {
    if (!selectedTemplate) {
      setVariables([])
      setVariableValues({})
      return
    }

    try {
      const regex = /{{(.*?)}}/g
      const vars: string[] = []
      let match

      while ((match = regex.exec(selectedTemplate.content)) !== null) {
        vars.push(match[1])
      }

      setVariables(vars)
      const initialValues = vars.reduce((acc, v) => ({ ...acc, [v]: "" }), {})
      setVariableValues(initialValues)
    } catch (error) {
      setVariables([])
      setVariableValues({})
    }
  }, [selectedTemplate])

  const selectionnerModele = (templateId: string) => {
    const template = templates.find((t) => t.id.toString() === templateId)
    setSelectedTemplate(template || null)
  }

  const changerValeurVariable = (variable: string, personneId: string) => {
    setVariableValues((prev) => ({ ...prev, [variable]: personneId }))
  }

  const ajouterNouvellePersonne = (variableName: string) => {
    setvariableActivePourModal(variableName)
    setModal(true)
  }

  const traiterNouvellePersonne = async (newPerson: any) => {
    setModal(false)
    const variableForRole = variableActivePourModal
    await fetchAllPersonnes()

    if (variableForRole && newPerson.id) {
      setVariableValues((prev) => ({
        ...prev,
        [variableForRole]: newPerson.id.toString(),
      }))
      setAlert({
        type: "success",
        message: `${newPerson.prenom} ${newPerson.nom} a été créé(e) et sélectionné(e) pour le rôle "${variableForRole}"`,
      })
    } else {
      setAlert({ type: "success", message: "Personne créée avec succès!" })
    }

    setvariableActivePourModal(null)
    setTimeout(() => setAlert(null), 4000)
  }

  const soumettreFormulaire = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplate) {
      setAlert({ type: "error", message: "Veuillez sélectionner un modèle de document" })
      return
    }

    const missingVariables = variables.filter((v) => !variableValues[v])
    if (missingVariables.length > 0) {
      setAlert({ type: "error", message: "Veuillez remplir tous les champs requis" })
      return
    }

    try {
      setIsSubmitting(true)
      setAlert(null)

      const templateIdInt = Number(selectedTemplate.id)
      const personnesInt = variables
        .map((v) => variableValues[v])
        .filter((val): val is string => val !== "")
        .map((id) => Number(id))

      const document = await createDocument({
        templateId: templateIdInt,
        personnes: personnesInt,
      })

      const documentId = document.id

      await Promise.all(
        variables
          .map((nomVariable) => {
            const personneIdStr = variableValues[nomVariable]
            if (!personneIdStr) return null
            return createDocumentPersonne({
              fonction: nomVariable,
              documentId,
              personneId: Number(personneIdStr),
            })
          })
          .filter(Boolean),
      )

      setAlert({ type: "success", message: "Document créé avec succès!" })
      router.push("/documents")
    } catch (error) {
      setAlert({ type: "error", message: "Erreur lors de la création du document" })
    } finally {
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

  if (!mounted) return null

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
              <h1 className="text-3xl font-bold text-slate-900">Créer un nouveau document</h1>
              <p className="text-slate-600">Sélectionnez un modèle et remplissez les informations requises</p>
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
            <form onSubmit={soumettreFormulaire} className="space-y-8">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label htmlFor="template" className="text-base font-semibold text-slate-900">
                  Modèle de document <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={selectedTemplate?.id?.toString() || ""}
                  onValueChange={selectionnerModele}
                  options={templateOptions}
                  placeholder="Sélectionnez un modèle de document"
                  searchPlaceholder="Rechercher un modèle..."
                  emptyMessage="Aucun modèle trouvé."
                  className="w-full border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12"
                />
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
                        <p className="text-sm text-slate-600">Assignez les personnes aux différents rôles</p>
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Créer le Document
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modal pour créer une nouvelle personne */}
        {Modal && (
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
                        Pour le rôle: <span className="font-semibold text-white">{variableActivePourModal}</span>
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
                      setModal(false)
                      setvariableActivePourModal(null)
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
                    setModal(false)
                    setvariableActivePourModal(null)
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

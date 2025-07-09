"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { getTemplates } from "@/services/DocumentTemplateService"
import {  createDocument, createDocumentPersonne } from "@/services/DocumentService"
import type { DocumentTemplate } from "@/types/DocumentTemplate"
import { FileText, Users, Plus, X, ArrowLeft, AlertCircle, CheckCircle, Sparkles } from "lucide-react"
import PersonneForm from "../personnes/createForm"
import { getAllPersonnes } from "@/services/PersonneService"
import Error500 from "@/components/errors/error-500"

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
    const reponse = await getAllPersonnes();
   if (reponse.status===500){
    <Error500 />

   }
   else{
      setPersonnes(reponse.data);
      return reponse.data;
    
   }
  } catch (err: any) {
    setPersonnes([]);
    return [];
  }
}
  useEffect(() => {
    fetchAllPersonnes()
  }, [fetchAllPersonnes])

  useEffect(() => {
    const listeTemplates = async () => {
      try {
        const data = await getTemplates()
        if (data.status === 500) {
          <Error500 />
          return
        }
        else{
           const  templatAvecVariablesRemplacer = await Promise.all(
          (data as DocumentTemplate[]).map(async (template) => {
            let content = template.content
            return { ...template, content }
          }),
        )

        setTemplates(templatAvecVariablesRemplacer)
        }
       
      } catch (error) {
        console.error("Erreur récupération templates :", error)
        setAlert({ type: "error", message: "Erreur lors du chargement des modèles" })
      }
    }

    listeTemplates()
  }, [])

  // Ce useEffect s'exécute à chaque fois que le modèle de document sélectionné (selectedTemplate) change.
  // Il sert à extraire dynamiquement les variables à remplir dans le contenu du template (ex: {{nom}}, {{prenom}}).
  // Si aucun template n'est sélectionné, on réinitialise les variables et leurs valeurs.
  // Sinon, on utilise une expression régulière pour trouver toutes les variables dynamiques dans le contenu du template.
  // Chaque variable trouvée est ajoutée à la liste 'vars'.
  // Ensuite, on initialise un objet 'initialValues' où chaque variable a une valeur vide (pour préparer le formulaire).
  // Si une erreur survient lors de l'extraction, on réinitialise les variables et leurs valeurs.
 useEffect(() => {
  // Si aucun modèle (template) n'est sélectionné, on réinitialise tout et on sort
  if (!selectedTemplate) {
    setVariables([])         // On vide la liste des variables
    setVariableValues({})    // On vide les valeurs des variables
    return                   // On quitte l'effet ici
  }

  try {
    // Définition d'une expression régulière pour capturer les variables de type {{nomVariable}}
    const regex = /{{(.*?)}}/g
    const vars: string[] = []  // Liste pour stocker les noms des variables trouvées

    let match
    // On parcourt toutes les correspondances dans le contenu du template
    while ((match = regex.exec(selectedTemplate.content)) !== null) {
      vars.push(match[1])  // match[1] contient le nom de la variable sans les accolades
    }

    setVariables(vars)  // On met à jour la liste des variables extraites

    // On initialise un objet où chaque variable est une clé avec une valeur vide ""
    const initialValues = vars.reduce((acc, v) => ({ ...acc, [v]: "" }), {})
    setVariableValues(initialValues)  // On enregistre ces valeurs initiales
  } catch (error) {
    // En cas d'erreur (par exemple, contenu invalide), on réinitialise tout
    setVariables([])
    setVariableValues({})
  }
}, [selectedTemplate])  // L'effet se déclenche à chaque fois que `selectedTemplate` change

  // Fonction appelée lorsqu’un utilisateur sélectionne un nouveau modèle (template) dans une liste déroulante
const selectionnerModele = (templateId: string) => {
  // Recherche dans la liste des templates celui dont l’ID (converti en string) correspond à celui sélectionné
  const template = templates.find((t) => t.id.toString() === templateId)

  // Met à jour l’état `selectedTemplate` avec le template trouvé ou `null` s’il n’existe pas
  setSelectedTemplate(template || null)
}


// Fonction appelée lorsqu'une variable est modifiée (sélection d'une personne existante)
const changerValeurVariable = (variable: string, personneId: string) => {
  // Met à jour l'état des valeurs des variables (assigne une personne à une variable)
  setVariableValues((prev) => ({ ...prev, [variable]: personneId }))
}

// Fonction appelée lorsqu'on souhaite ajouter une nouvelle personne pour une variable donnée
const ajouterNouvellePersonne = (variableName: string) => {
  // On garde en mémoire le nom de la variable concernée
  setvariableActivePourModal(variableName)
  // On ouvre la modale de création de personne
  setModal(true)
}

// Fonction appelée après la création d'une nouvelle personne depuis la modale
const traiterNouvellePersonne = async (newPerson: any) => {
  // Ferme la modale
  setModal(false)

  // Récupère la variable pour laquelle on a ouvert la modale
  const variableForRole = variableActivePourModal

  // Recharge toutes les personnes (mise à jour de la liste déroulante par exemple)
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
  setvariableActivePourModal(null)

  // Supprime le message d'alerte après 4 secondes
  setTimeout(() => setAlert(null), 4000)
}

// Fonction appelée lors de la soumission du formulaire pour créer le document
const soumettreFormulaire = async (e: React.FormEvent) => {
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

    // Conversion de l'ID du template en entier
    const templateIdInt = Number(selectedTemplate.id)

    // Extraction et conversion des IDs de personnes associés aux variables
    const personnesInt = variables
      .map((v) => variableValues[v])              // Récupère l'ID (string)
      .filter((val): val is string => val !== "") // Garde uniquement les valeurs non vides
      .map((id) => Number(id))                    // Convertit en nombre

    // Crée le document avec l'ID du modèle et la liste des personnes associées
    const document = await createDocument({
      templateId: templateIdInt,
      personnes: personnesInt
    })

    // Récupère l'ID du document créé
    const documentId = document.id

    // Pour chaque variable, crée un lien entre le document, le rôle (variable) et la personne sélectionnée
    await Promise.all(
      variables
        .map((nomVariable) => {
          const personneIdStr = variableValues[nomVariable]
          if (!personneIdStr) return null // si pas de valeur, on ignore
          return createDocumentPersonne({
            fonction: nomVariable,               // le nom de la variable (ex: directeur)
            documentId,                          // ID du document créé
            personneId: Number(personneIdStr),   // ID de la personne liée
          })
        })
        .filter(Boolean), // enlève les "null"
    )

    // Affiche un message de succès
    setAlert({ type: "success", message: "Document créé avec succès!" })

    // Redirige vers la liste des documents après 1.5 secondes

    router.push("/documents")

  } catch (error) {
    // En cas d'erreur lors de la création
   // console.error("Erreur lors de la création du document :", error)
    setAlert({ type: "error", message: "Erreur lors de la création du document" })
  } finally {
    // Fin de la soumission
    setIsSubmitting(false)
  }
}


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
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
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
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations du document
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={soumettreFormulaire} className="space-y-8">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label htmlFor="template" className="text-base font-semibold text-slate-900">
                  Modèle de document <span className="text-red-500">*</span>
                </Label>
                {/*
                  Sélecteur de modèle de document :
                  - value : contrôle la valeur sélectionnée (id du template sous forme de string)
                  - onValueChange : met à jour le template sélectionné dans le state
                  - Si aucun modèle n'est disponible, affiche un message d'alerte
                  - Chaque option affiche le nom du modèle (en gras) et son ID (en petit)
                */}
                <Select
                  value={selectedTemplate?.id?.toString() || ""}
                  onValueChange={selectionnerModele}
                >
                  <SelectTrigger className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12">
                    <SelectValue placeholder="Sélectionnez un modèle de document" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Affichage si aucun modèle n'est disponible */}
                    {templates.length === 0 && (
                      <div className="text-red-500 px-4 py-2">Aucun modèle disponible</div>
                    )}
                    {/* Boucle sur les modèles pour créer les options du select */}
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id?.toString?.() || ""}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {/* Nom du modèle en gras */}
                          <span className="font-semibold text-slate-900">{template.typeDocument}</span>
                          {/* Affichage de l'ID du modèle en petit */}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                                  <Select
                                    value={variableValues[variable] || ""}
                                    onValueChange={(value) => changerValeurVariable(variable, value)}
                                  >
                                    <SelectTrigger className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11">
                                      <SelectValue placeholder={`Sélectionnez ${variable.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {personnes.map((personne) => (
                                        <SelectItem key={personne.id} value={personne.id.toString()}>
                                          <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {personne.prenom} {personne.nom}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
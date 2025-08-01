"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import personneService from "@/services/api.personne"
import type { Personne } from "@/types/personne"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Save,
  User,
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  Flag,
  CreditCard,
  Home,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const EditPersonnePage = () => {
  const { id } = useParams()
  const router = useRouter()

  const [personne, setPersonne] = useState<Personne>({
    id: 0,
    nom: "",
    prenom: "",
    profession: "",
    dateNaissance: "",
    nationalite: "",
    numeroCni: "",
    sexe: "",
    lieuNaissance: "",
    telephone: "",
    adresse: "",
    archive: false,
    documentPersonnes: "",
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const personneData = await personneService.getById(Number(id))
          if (personneData) {
            setPersonne(personneData)
          } else {
            setError("Personne non trouvée")
          }
        }
      } catch (err: any) {
        setError(err.message || "Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (name: string, value: string) => {
    setPersonne({ ...personne, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Validation basique
      if (!personne.nom || !personne.prenom) {
        throw new Error("Le nom et le prénom sont obligatoires")
      }

      console.log("Données envoyées :", personne)
      await personneService.update(Number(id), personne)
      setSuccess("Mise à jour réussie !")

      // Attendre un peu avant de rediriger pour montrer le message de succès
      setTimeout(() => {
        router.push("/personnes")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour.")
    } finally {
      setSubmitting(false)
    }
  }

  // Formater la date pour l'input date
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline" size="sm" className="gap-1">
          <Link href={`/personnes/show/${id}`}>
            <ChevronLeft className="h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Modifier la fiche</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 text-green-700 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardTitle className="text-xl">
              Modifier les informations de {personne.prenom} {personne.nom}
            </CardTitle>
            <CardDescription className="text-blue-100">
              Tous les champs marqués d'un * sont obligatoires
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations personnelles
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Coordonnées
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={personne.nom}
                      onChange={(e) => handleChange("nom", e.target.value)}
                      placeholder="Nom de famille"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      value={personne.prenom}
                      onChange={(e) => handleChange("prenom", e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sexe">Sexe</Label>
                    <Select value={personne.sexe || ""} onValueChange={(value) => handleChange("sexe", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Homme</SelectItem>
                        <SelectItem value="F">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      Date de naissance
                    </Label>
                    <Input
                      id="dateNaissance"
                      name="dateNaissance"
                      type="date"
                      value={formatDateForInput(personne.dateNaissance)}
                      onChange={(e) => handleChange("dateNaissance", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lieuNaissance" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      Lieu de naissance
                    </Label>
                    <Input
                      id="lieuNaissance"
                      name="lieuNaissance"
                      value={personne.lieuNaissance || ""}
                      onChange={(e) => handleChange("lieuNaissance", e.target.value)}
                      placeholder="Ville de naissance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalite" className="flex items-center gap-1">
                      <Flag className="h-4 w-4 text-slate-500" />
                      Nationalité
                    </Label>
                    <Input
                      id="nationalite"
                      name="nationalite"
                      value={personne.nationalite || ""}
                      onChange={(e) => handleChange("nationalite", e.target.value)}
                      placeholder="Nationalité"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    Profession
                  </Label>
                  <Input
                    id="profession"
                    name="profession"
                    value={personne.profession || ""}
                    onChange={(e) => handleChange("profession", e.target.value)}
                    placeholder="Profession ou métier"
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="telephone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-slate-500" />
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={personne.telephone || ""}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    placeholder="Numéro de téléphone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse" className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-slate-500" />
                    Adresse
                  </Label>
                  <Textarea
                    id="adresse"
                    name="adresse"
                    value={personne.adresse || ""}
                    onChange={(e) => handleChange("adresse", e.target.value)}
                    placeholder="Adresse complète"
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="numeroCni" className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    Numéro CNI
                  </Label>
                  <Input
                    id="numeroCni"
                    name="numeroCni"
                    value={personne.numeroCni || ""}
                    onChange={(e) => handleChange("numeroCni", e.target.value)}
                    placeholder="Numéro de carte nationale d'identité"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-slate-50 p-6">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default EditPersonnePage
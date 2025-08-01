"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { createPersonne } from "@/services/PersonneService"
import type { Personne as FullPersonneType } from "@/types/DocumentTemplate"
import { User, Phone, MapPin, Briefcase, Calendar, CreditCard, Globe, AlertCircle, Users } from "lucide-react"

const sexeOptions = [
  { label: "Masculin", value: "Masculin" },
  { label: "Féminin", value: "Féminin" },
]

const personneSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  profession: z.string().optional(),
  dateNaissance: z.string().optional(),
  nationalite: z.string().optional(),
  numeroCni: z.string().optional(),
  sexe: z
    .enum(["Masculin", "Féminin", ""])
    .optional(),
  lieuNaissance: z.string().optional(),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
})

type PersonneFormData = z.infer<typeof personneSchema>

interface PersonneFormProps {
  onPersonCreated: (personne: Pick<FullPersonneType, "id" | "nom" | "prenom">) => void
  onCancel?: () => void
}

export default function PersonneForm({ onPersonCreated, onCancel }: PersonneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const form = useForm<PersonneFormData>({
    resolver: zodResolver(personneSchema),
    defaultValues: {
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
    },
  })

  const onSubmit = async (data: PersonneFormData) => {
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      // Convert all undefined string fields to empty string to match Personne type
      const safeData = {
        ...data,
        profession: data.profession ?? "",
        dateNaissance: data.dateNaissance ?? "",
        nationalite: data.nationalite ?? "",
        numeroCni: data.numeroCni ?? "",
        sexe: data.sexe ?? "",
        lieuNaissance: data.lieuNaissance ?? "",
        telephone: data.telephone ?? "",
        adresse: data.adresse ?? "",
      }
      const nouvellePersonne = await createPersonne(safeData)

      // S'assurer que l'ID est bien présent
      if (nouvellePersonne && nouvellePersonne.id) {
        onPersonCreated({
          id: nouvellePersonne.id,
          nom: nouvellePersonne.nom,
          prenom: nouvellePersonne.prenom,
        })
        form.reset()
      } else {
        throw new Error("Erreur lors de la création : ID manquant")
      }
    } catch (error) {
      console.error("Erreur lors de la création :", error)
      setSubmissionError(error instanceof Error ? error.message : "Une erreur inconnue est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {submissionError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{submissionError}</AlertDescription>
          </Alert>
        )}

        {/* Section Identité */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Indicateur de contexte si on vient du modal */}
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Cette personne sera automatiquement assignée après création</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nom *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom de famille"
                        {...field}
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Prénom *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sexe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexe</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="-- Sélectionner --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sexeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateNaissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de naissance
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="border-blue-200 focus:border-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Section Documents */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
              <CreditCard className="h-5 w-5" />
              Documents officiels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numeroCni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Numéro CNI
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789"
                        {...field}
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Nationalité
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Française"
                        {...field}
                        className="border-emerald-200 focus:border-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lieuNaissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lieu de naissance
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paris, France"
                      {...field}
                      className="border-emerald-200 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Section Contact */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Phone className="h-5 w-5" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="0123456789"
                        {...field}
                        className="border-purple-200 focus:border-purple-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Profession
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ingénieur" {...field} className="border-purple-200 focus:border-purple-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Rue de la République, 75001 Paris"
                      {...field}
                      className="border-purple-200 focus:border-purple-500 resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
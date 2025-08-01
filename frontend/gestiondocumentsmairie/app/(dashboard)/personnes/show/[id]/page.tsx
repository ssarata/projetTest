import { notFound } from "next/navigation"
import Link from "next/link"
import type { Personne } from "@/types/personne"
import personneService from "@/services/api.personne"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronLeft,
  User,
  Briefcase,
  Calendar,
  MapPin,
  Flag,
  Phone,
  Home,
  CreditCard,
  FileText,
  Mail,
} from "lucide-react"

type Props = {
  params: { id: string }
}

export default async function PersonneDetailPage({ params }: Props) {
  const id = Number.parseInt(params.id, 10)

  if (isNaN(id)) return notFound()
  let personne: Personne | null = null

  try {
    personne = await personneService.getById(id)
  } catch (error) {
    console.error("Erreur lors de la récupération de la personne :", error)
  }

  if (!personne) return notFound()

  // Fonction pour obtenir les initiales
  const getInitials = (nom: string, prenom: string) => {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase()
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "—"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit gap-1">
          <Link href="/personnes">
            <ChevronLeft className="h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href={`/personnes/edit/${personne.id}`}>
              <Mail className="h-4 w-4" />
              Modifier
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
            <Link href={`/personnes/documents/${personne.id}`}>
              <FileText className="h-4 w-4" />
              Voir les documents
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Carte d'identité principale */}
        <Card className="md:col-span-3 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-900 to-green-500 text-white pb-12">
            <CardTitle className="text-xl font-medium opacity-80">Fiche détaillée</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 relative">
            {/* <div className="absolute -top-10 flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md bg-white">
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                  {getInitials(personne.nom, personne.prenom)}
                </AvatarFallback>
              </Avatar>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {personne.nom} {personne.prenom}
                </h1>
                {personne.profession && (
                  <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 border-blue-200">
                    {personne.profession}
                  </Badge>
                )}
              </div>
            </div> */}

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Informations personnelles */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    {/* <User className="h-5 w-5 text-blue-600" /> */}
                    Informations personnelles
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Sexe</span>
                      <span>{personne.sexe || "—"}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Date de naissance</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(personne.dateNaissance)}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Lieu de naissance</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {personne.lieuNaissance || "—"}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Nationalité</span>
                      <span className="flex items-center gap-1">
                        <Flag className="h-4 w-4 text-slate-400" />
                        {personne.nationalite || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Profession
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Métier</span>
                      <span>{personne.profession || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordonnées et documents */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Coordonnées
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Téléphone</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {personne.telephone || "—"}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Adresse</span>
                      <span className="flex items-start gap-1">
                        <Home className="h-4 w-4 text-slate-400 mt-0.5" />
                        <span>{personne.adresse || "—"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Documents d'identité
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 items-center">
                      <span className="text-sm font-medium text-slate-500">Numéro CNI</span>
                      <span>{personne.numeroCni || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {/* <CardFooter className="bg-slate-50 flex justify-between">
            <span className="text-sm text-slate-500">ID: {personne.id}</span>
            <span className="text-sm text-slate-500">
              {personne.dateCreation
                ? `Créé le ${formatDate(personne.dateCreation)}`
                : "Date de création non disponible"}
            </span>
          </CardFooter> */}
        </Card>
      </div>
    </main>
  )
}
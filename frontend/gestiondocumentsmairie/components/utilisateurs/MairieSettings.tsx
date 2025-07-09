"use client"

import { useEffect, useState } from "react"
import mairieService, { type Mairie } from "@/services/mairie"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  MapPin,
  Globe,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Settings,
  Shield,
  Camera,
  Star,
  Award,
} from "lucide-react"
import MairieForm from "./MairieForm"

export default function AttractiveMairieDetails() {
  const [mairie, setMairie] = useState<Mairie | null>(null)
  const [mairieId, setMairieId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMairie = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true)
    else setLoading(true)

    setError(null)

    try {
      const data = await mairieService.getAll()
      if (!data || data.length === 0) {
        setError("Aucune mairie trouvée dans le système.")
        setMairie(null)
        setMairieId(null)
      } else {
        setMairie(data[0])
        setMairieId(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || "Échec de la récupération des données de la mairie.")
      console.error("Erreur API :", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMairie()
  }, [])

  const handleRefresh = () => {
    fetchMairie(true)
  }

  const handleEditSuccess = (updatedMairie: Mairie) => {
    setMairie(updatedMairie)
    setIsEditing(false)
  }

  // Composant de skeleton amélioré
  const MairieDetailsSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* Main Card Skeleton */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-t-lg pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Logo Skeleton */}
              <div className="flex justify-center mb-8">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>

              {/* Info Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 rounded-b-lg px-8 py-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )

  if (loading) return <MairieDetailsSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Erreur de chargement</h2>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={handleRefresh} disabled={refreshing} className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Actualisation..." : "Réessayer"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!mairie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md mx-auto p-4">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune mairie configurée</h3>
              <p className="text-slate-600 mb-6">
                Il semble qu'aucune mairie ne soit encore configurée dans le système.
              </p>
              <Button onClick={handleRefresh} disabled={refreshing} className="bg-emerald-600 hover:bg-emerald-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Actualisation..." : "Actualiser"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header amélioré */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Administration Municipale</h1>
          </div>
          <p className="text-slate-600 text-lg">Configuration et informations de votre mairie</p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            {/* Header avec gradient */}
            <CardHeader className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-blue-50 border-b-0 pb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Mairie de {mairie.commune} {mairie.ville}</CardTitle>
                    <p className="text-slate-600 mt-1">Configuration principale du système</p>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Système actif
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Logo avec design amélioré */}
              {mairie.logo && (
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full blur-lg opacity-20"></div>
                    <img
                      src={`http://localhost:3000/api/mairies/uploads/${mairie.logo}`}
                      alt={`Logo de la mairie de ${mairie.ville}`}
                      width={128}
                      height={128}
                      // className="relative rounded-full object-cover border-4 border-white shadow-xl"
                    />
                    {/* <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white shadow-md hover:shadow-lg"
                    >
                      <Camera className="h-3 w-3" />
                    </Button> */}
                  </div>
                </div>
              )}

              {/* Informations principales avec design en grille */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Ville */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-emerald-700">Ville</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{mairie.ville}</p>
                </div>

                {/* Commune */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Commune</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{mairie.commune}</p>
                </div>

                {/* Région */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-700">Région</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{mairie.region}</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-purple-700">Préfecture</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{mairie.prefecture}</p>
                </div>

                {/* ID Système */}
                {/* <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-orange-700">ID Système</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">#{mairieId}</p>
                </div> */}

                {/* Statut */}
                {/* <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Statut</span>
                  </div>
                  <p className="text-xl font-bold text-green-800">Opérationnel</p>
                </div> */}

                {/* Dernière MAJ */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Dernière MAJ</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{new Date().toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Statistiques et informations supplémentaires */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Documents générés</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <Award className="h-8 w-8 text-emerald-200" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Utilisateurs actifs</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Taux de satisfaction</p>
                      <p className="text-2xl font-bold">98%</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-200" />
                  </div>
                </div>
              </div> */}

              {/* Informations système */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Informations système
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Configuration principale de l'application</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Utilisée pour tous les documents officiels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Synchronisation automatique activée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Sauvegarde quotidienne à 02:00</span>
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Footer avec boutons améliorés */}
            <CardFooter className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-t px-8 py-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier les informations
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  disabled={refreshing}
                  className="flex-1 sm:flex-none border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200 gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Actualisation..." : "Actualiser"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal d'édition amélioré */}
      {isEditing && mairie && mairieId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-0">
            <MairieForm
              mairie={mairie}
              mairieId={mairieId}
              onClose={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}
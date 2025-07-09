"use client"

import { useEffect, useState } from "react"

import { useToast } from "@/components/ui/use-toast"

// Services and Types
import { getUserById } from "@/services/userService"
import type { User } from "@/types/LoginResponse"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, User as UserIcon, Mail, Shield, Calendar } from "lucide-react"

// The modal component from the file you provided
import { UserProfileModal } from "@/components/utilisateurs/UserDetailModal";

export default function ProfilePage() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // On récupère l'ID de l'utilisateur depuis le localStorage.
    // Il est stocké ici lors de la connexion.
    const userId = localStorage.getItem("userId")

    if (userId) {
      const fetchUserData = async () => {
        setIsLoading(true)
        try {
          const data = await getUserById(userId)
          setUser(data)
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les informations du profil.",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchUserData()
    } else {
      setIsLoading(false)
      toast({
        title: "Non authentifié",
        description: "Veuillez vous connecter pour voir votre profil.",
      })
      // Optionally redirect to login page
      // router.push('/login');
    }
  }, [toast])

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  }

  const getInitials = (prenom?: string, nom?: string) => {
    const firstInitial = prenom?.charAt(0)?.toUpperCase() || ""
    const lastInitial = nom?.charAt(0)?.toUpperCase() || ""
    return firstInitial + lastInitial || "P"
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive"
      case "moderator":
        return "default"
      default:
        return "secondary"
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        {renderSkeleton()}
      </main>
    )
  }

  if (!user) {
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl text-center">
          <p className="text-slate-600">
            Impossible de charger le profil. Veuillez vous reconnecter.
          </p>
          {/* Ajoutez ici un bouton pour rediriger vers la page de connexion si nécessaire */}
          {/* <Button onClick={() => router.push('/login')}>Se connecter</Button> */}
        </main>
    )
  }

  return (
    <>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-3xl">
                {getInitials(user.personne?.prenom, user.personne?.nom)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-slate-800">
                {user.personne?.prenom} {user.personne?.nom}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                {/* <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                  {user.role || "Utilisateur"}
                </Badge> */}
                {/* <span className="text-slate-400">•</span>
                <span className="text-slate-600 text-sm">ID: {user.id}</span> */}
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl text-slate-700">
                <UserIcon className="h-6 w-6 text-emerald-600" />
                <span>Mes informations</span>
              </CardTitle>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"> <UserIcon className="h-5 w-5 text-emerald-600" /> </div>
                <div className="flex-1"> <p className="text-sm text-slate-600 font-medium">Nom complet</p> <p className="font-semibold text-slate-800 text-lg"> {user.personne?.prenom} {user.personne?.nom} </p> </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"> <Mail className="h-5 w-5 text-blue-600" /> </div>
                <div className="flex-1"> <p className="text-sm text-slate-600 font-medium">Adresse email</p> <p className="font-semibold text-slate-800">{user.email}</p> </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"> <Shield className="h-5 w-5 text-purple-600" /> </div>
                <div className="flex-1"> <p className="text-sm text-slate-600 font-medium">Rôle</p> <div className="flex items-center gap-2 mt-1"> <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize"> {user.role || "Utilisateur"} </Badge> </div> </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"> <Calendar className="h-5 w-5 text-green-600" /> </div>
                <div className="flex-1"> <p className="text-sm text-slate-600 font-medium">Statut</p> <div className="flex items-center gap-2 mt-1"> <div className="w-2 h-2 bg-green-500 rounded-full"></div> <span className="text-sm font-medium text-green-700">Actif</span> </div> </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* The Modal for editing */}
      {user && (
        <UserProfileModal
          user={user}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </>
  )
}
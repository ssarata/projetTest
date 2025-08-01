"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Clock, Bell, ChevronDown, LogOut, User, Moon, Sun } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { getUserById } from "@/services/userService"
import type { User as UserType } from "@/types/LoginResponse"
import Link from "next/link"

export default function Header() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userId, setUserId] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null)
  const [isFetchingUser, setIsFetchingUser] = useState(true)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Récupérer l'ID de l'utilisateur depuis localStorage
    const storedUserId = localStorage.getItem("userId")
    setUserId(storedUserId)

    // Récupérer les données de l'utilisateur si l'ID existe
    if (storedUserId) {
      const fetchUser = async () => {
        setIsFetchingUser(true)
        try {
          const user = await getUserById(storedUserId)
          setLoggedInUser(user)
        } catch (error) {
          console.error("Échec de la récupération de l'utilisateur connecté :", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les informations de l'utilisateur connecté.",
            variant: "destructive",
          })
          setLoggedInUser(null)
        } finally {
          setIsFetchingUser(false)
        }
      }
      fetchUser()
    } else {
      setIsFetchingUser(false)
    }

    return () => clearInterval(interval)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    })
    router.push("/utilisateurs/login")
    setIsLogoutDialogOpen(false)
  }

  const handleOpenDetailModal = () => {
    if (loggedInUser) {
      setIsDetailModalOpen(true)
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    // Modal handles its own state
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm sticky top-0 z-40 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo ou titre de l'application */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Administration</h1>
        </div>

        {/* Infos utilisateur + système */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span>{formattedTime}</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline">{formattedDate}</span>
          </div>

          {/* Bouton de thème */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-300 hover:bg-emerald-100/30 dark:hover:bg-slate-700 transition"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Changer le thème"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 dark:text-slate-300 hover:bg-emerald-100/30 dark:hover:bg-slate-700 transition"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full" />
          </Button>

          {/* Profil utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 px-2 rounded-lg transition"
              >
                <Avatar className="h-9 w-9 border border-emerald-200">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Admin" />
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {loggedInUser?.personne?.prenom?.[0] || loggedInUser?.email?.[0] || "A"}
                    {loggedInUser?.personne?.nom?.[0] || "M"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-semibold">
                  {loggedInUser?.personne?.prenom || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-700 dark:text-white min-w-44"
            >
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Déconnexion avec confirmation */}
              <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setIsLogoutDialogOpen(true)
                    }}
                    className="hover:bg-red-100 dark:hover:bg-red-600/20 text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <LogOut className="h-5 w-5 text-red-600" />
                      Confirmer la déconnexion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre
                      compte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                      Se déconnecter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
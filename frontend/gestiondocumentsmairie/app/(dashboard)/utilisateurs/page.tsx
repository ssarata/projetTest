"use client"

import { useEffect, useState } from "react"
import { getAllUsers, archiveUser } from "@/services/userService"
import type { User } from "@/types/LoginResponse" // Assurez-vous que ce chemin est correct
import { Root, Body, Cell, Head, Header, Row } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast" // Import du hook useToast
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Search, X, Users, UserX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

// Vous pourriez vouloir ajouter un ToggleGroup pour le filtre d'état
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast() // Initialisation du hook toast
  const [search, setSearch] = useState("") // Added search state
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    fetchUsersData()
  }, [])

  const fetchUsersData = async () => {
    setIsLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err: any) {
      handleApiError(err, "Erreur lors de la récupération des utilisateurs.")
    } finally {
      setIsLoading(false) // Assurer que isLoading est mis à jour
    }
  }

  // Remplacer handleApiError pour utiliser toast
  const handleApiError = (err: any, defaultMessage: string) => {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: err.message || defaultMessage,
    })
    console.error(err)
  }

  const performDeleteUser = async (userId: string, userName: string) => {
    try {
      // Au lieu de supprimer, nous archivons l'utilisateur
      await archiveUser(userId)
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId))
      toast({
        title: "Suppression réussie",
        description: `L'utilisateur "${userName}" a été supprimé (archivé) avec succès.`,
      })
    } catch (err: any) {
      // Le message d'erreur est également formulé comme une erreur de suppression
      handleApiError(err, `Erreur lors de la tentative de suppression de l'utilisateur "${userName}".`)
    }
  }

  const clearSearch = () => {
    setSearch("")
  }

  // Filtrer pour afficher uniquement les utilisateurs non archivés et appliquer le filtre de recherche
  const filteredUsers = users.filter((user) => {
    if (user.archivedAt) return false // Afficher uniquement les utilisateurs non archivés

    // Apply search filter
    const searchTerm = search.toLowerCase()
    return (
      user.personne?.nom?.toLowerCase().includes(searchTerm) ||
      user.personne?.prenom?.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    )
  })

  // Message si aucun utilisateur ne correspond au filtre et à la recherche
  const noUsersMessage = search ? `Aucun utilisateur trouvé pour "${search}".` : "Aucun utilisateur actif trouvé."

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-slate-700">Chargement des utilisateurs...</p>
        {/* Vous pourriez ajouter un spinner ici */}
      </div>
    )
  }

  // Suppression du bloc d'affichage d'erreur car géré par toast

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Liste des Utilisateurs</h1>
        <Link href="/utilisateurs/register">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Ajouter un utilisateur</Button>
        </Link>
      </div>

      {/* Enhanced Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Input Container */}
          <div className="relative flex-1 max-w-md">
            <motion.div
              animate={{
                scale: isFocused ? 1.02 : 1,
                boxShadow: isFocused
                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />

              {/* Input Field */}
              <Input
                placeholder="Rechercher un utilisateur (nom, prénom, email)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl transition-all duration-200"
              />

              {/* Clear Button */}
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {isFocused && !search && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Conseils de recherche :</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs">
                      Nom complet
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs">
                      Adresse email
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs">
                      Prénom uniquement
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
          >
            <Users className="h-4 w-4" />
            <span>
              {search ? (
                <>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{filteredUsers.length}</span>
                  {" résultat(s) trouvé(s)"}
                </>
              ) : (
                <>
                  <span className="font-medium">{filteredUsers.length}</span>
                  {" utilisateur(s) actif(s)"}
                </>
              )}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced No Results State */}
      {filteredUsers.length === 0 && !isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"
          >
            {search ? <UserX className="h-8 w-8 text-slate-400" /> : <Users className="h-8 w-8 text-slate-400" />}
          </motion.div>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
          >
            {search ? "Aucun résultat trouvé" : "Aucun utilisateur"}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto"
          >
            {search
              ? `Aucun utilisateur ne correspond à "${search}". Essayez avec d'autres termes de recherche.`
              : noUsersMessage}
          </motion.p>

          {search && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={clearSearch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <X className="h-4 w-4" />
              Effacer la recherche
            </motion.button>
          )}
        </motion.div>
      ) : (
        <Root className="mt-4 bg-white shadow-md rounded-lg">
          <Header>
            <Row className="bg-slate-50">
              <Head className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nom
              </Head>
              <Head className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Prénom
              </Head>
              <Head className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </Head>
              <Head className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Rôle
              </Head>
              <Head className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </Head>
            </Row>
          </Header>
          <Body className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <Row
                key={user.id}
                className={`hover:bg-slate-50 transition-colors`} // La classe pour l'opacité des archivés n'est plus nécessaire
              >
                <Cell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {user.personne?.nom || "N/A"}
                </Cell>
                <Cell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {user.personne?.prenom || "N/A"}
                </Cell>
                <Cell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.email}</Cell>
                <Cell className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 capitalize">
                  {user.role || "Non défini"}
                </Cell>
                <Cell className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  {/* <Link href={`/utilisateurs/${user.id}`} passHref>
                    <Button variant="outline" size="sm" title="Voir les détails">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link> */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" title="Supprimer (Archiver)">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action archivera l'utilisateur "{user.personne?.prenom || ""}{" "}
                          {user.personne?.nom || user.email}". Il ne sera plus visible dans la liste principale mais
                          pourra être restauré depuis les archives.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            performDeleteUser(
                              user.id,
                              `${user.personne?.prenom || ""} ${user.personne?.nom || user.email}`,
                            )
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirmer la suppression
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Cell>
              </Row>
            ))}
          </Body>
        </Root>
      )}
    </div>
  )
}

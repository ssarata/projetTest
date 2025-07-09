"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/types/LoginResponse"
import { Root, Body, Cell, Head, Header, Row } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  ArchiveRestore,
  Search,
  X,
  Archive,
  ArrowLeft,
  Users,
  AlertTriangle,
  Calendar,
  Loader2,
  UserX,
} from "lucide-react"
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
import { getAllUsers, restoreUser, deleteUser, handleApiServiceError } from "@/services/userService"

export default function ArchivedUsersListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchArchivedUsersData()
  }, [])

  const fetchArchivedUsersData = async () => {
    setIsLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data.filter((user) => user.archivedAt))
    } catch (err: any) {
      handleApiServiceError(err, "Erreur lors de la récupération des utilisateurs archivés.")
    } finally {
      setIsLoading(false)
    }
  }

  const performRestoreUser = async (userId: string, userName: string) => {
    try {
      await restoreUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast({
        title: "Restauration réussie",
        description: `L'utilisateur "${userName}" a été restauré avec succès.`,
      })
    } catch (err: any) {
      handleApiServiceError(err, "Erreur lors de la restauration.")
    }
  }

  const performDeleteUserDefinitive = async (userId: string, userName: string) => {
    const confirmationPrompt = prompt(
      `Cette action est irréversible. Tapez 'SUPPRIMER' pour confirmer la suppression de l'utilisateur "${userName}".`,
    )

    if (confirmationPrompt !== "SUPPRIMER") {
      toast({
        title: "Action annulée",
        description: "La suppression a été annulée.",
      })
      return
    }

    try {
      await deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast({
        title: "Suppression réussie",
        description: `L'utilisateur "${userName}" a été supprimé définitivement.`,
      })
    } catch (err: any) {
      handleApiServiceError(err, "Erreur lors de la suppression.")
    }
  }

  const clearSearch = () => {
    setSearch("")
  }

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase()
    return (
      user.email?.toLowerCase().includes(term) ||
      user.personne?.prenom?.toLowerCase().includes(term) ||
      user.personne?.nom?.toLowerCase().includes(term)
    )
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non défini"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Date invalide"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex justify-center items-center h-screen">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"
            >
              <Loader2 className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </motion.div>
            <p className="text-lg text-slate-700 dark:text-slate-300">Chargement des utilisateurs archivés...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/utilisateurs"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à la liste</span>
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Utilisateurs Archivés</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gestion des comptes archivés</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />

                <Input
                  placeholder="Rechercher un utilisateur archivé (nom, prénom, email)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="pl-10 pr-10 h-12 border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500 dark:focus:border-orange-400 dark:focus:ring-orange-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl transition-all duration-200"
                />

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
            </div>

            {/* Search Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
            >
              <Archive className="h-4 w-4" />
              <span>
                {search ? (
                  <>
                    <span className="font-medium text-orange-600 dark:text-orange-400">{filteredUsers.length}</span>
                    {" résultat(s) trouvé(s)"}
                  </>
                ) : (
                  <>
                    <span className="font-medium">{filteredUsers.length}</span>
                    {" utilisateur(s) archivé(s)"}
                  </>
                )}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Zone d'administration sensible</p>
              <p>
                Les utilisateurs archivés peuvent être restaurés ou supprimés définitivement. La suppression définitive
                est irréversible.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredUsers.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4"
              >
                {search ? <UserX className="h-8 w-8 text-slate-400" /> : <Archive className="h-8 w-8 text-slate-400" />}
              </motion.div>

              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
              >
                {search ? "Aucun résultat trouvé" : "Aucun utilisateur archivé"}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto"
              >
                {search
                  ? `Aucun utilisateur archivé ne correspond à "${search}".`
                  : "Aucun utilisateur n'a été archivé pour le moment."}
              </motion.p>

              {search && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <X className="h-4 w-4" />
                  Effacer la recherche
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <Root>
                <Header>
                  <Row className="bg-slate-50 dark:bg-slate-700/50">
                    <Head className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Utilisateur
                      </div>
                    </Head>
                    <Head className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </Head>
                    <Head className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Rôle
                    </Head>
                    <Head className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date d'archivage
                      </div>
                    </Head>
                    <Head className="px-6 py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </Head>
                  </Row>
                </Header>
                <Body className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <Cell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {(user.personne?.prenom?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {user.personne?.prenom} {user.personne?.nom}
                            </div>
                            {/* <Badge
                              variant="secondary"
                              className="mt-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            >
                              Archivé
                            </Badge> */}
                          </div>
                        </div>
                      </Cell>
                      <Cell className="px-6 py-4 text-slate-700 dark:text-slate-300">{user.email}</Cell>
                      <Cell className="px-6 py-4">
                        <Badge variant="outline" className="capitalize">
                          {user.role || "Non défini"}
                        </Badge>
                      </Cell>
                      <Cell className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                        {formatDate(user.archivedAt)}
                      </Cell>
                      <Cell className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Restauration */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:border-green-700 dark:hover:text-green-400 bg-transparent"
                                title="Restaurer cet utilisateur"
                              >
                                <ArchiveRestore className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <ArchiveRestore className="h-5 w-5 text-green-600" />
                                  Restaurer l'utilisateur
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir restaurer l'utilisateur "{user.personne?.prenom || ""}{" "}
                                  {user.personne?.nom || user.email}" ? Il sera de nouveau visible dans la liste des
                                  utilisateurs actifs et pourra se connecter.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    performRestoreUser(
                                      user.id,
                                      `${user.personne?.prenom || ""} ${user.personne?.nom || user.email}`,
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirmer la restauration
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Suppression définitive */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="hover:bg-red-600"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                  <AlertTriangle className="h-5 w-5" />
                                  Suppression définitive
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                      <span>
                                        Cette action est <strong>irréversible</strong>.
                                      </span>
                                      <br />
                                      <span>
                                        Supprimer définitivement l'utilisateur "{user.personne?.prenom || ""} {user.personne?.nom || user.email}" ?
                                      </span>
                                      <span className="block p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200 mt-2">
                                        ⚠️ Toutes les données associées à cet utilisateur seront perdues définitivement.
                                      </span>
                                    
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    performDeleteUserDefinitive(
                                      user.id,
                                      `${user.personne?.prenom || ""} ${user.personne?.nom || user.email}`,
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer définitivement
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </Cell>
                    </motion.tr>
                  ))}
                </Body>
              </Root>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

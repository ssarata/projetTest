"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Services and Types
import { updateUser } from "@/services/userService"
import type { User } from "@/types/LoginResponse" // Type pour l'objet utilisateur

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserIcon, Mail, Save, X, Shield, Eye, EyeOff } from "lucide-react"
// Validation Schemas
// Schéma de validation pour le formulaire de profil utilisateur
const profileSchema = z.object({
  // Ajout de min(1) pour s'assurer que les champs ne sont pas vides
  prenom: z.string().min(1, "Le prénom est requis").min(2, "Le prénom doit contenir au moins 2 caractères"),
  nom: z.string().min(1, "Le nom est requis").min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
})

// Schéma de validation pour le formulaire de changement de mot de passe
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis."),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

/**
 * Props pour le composant UserProfileModal.
 */
interface UserProfileModalProps {
  user: User | null; // L'objet utilisateur à afficher et modifier.
  isOpen: boolean; // État pour contrôler la visibilité de la modale.
  onClose: () => void; // Fonction pour fermer la modale.
  onUserUpdate: (updatedUser: User) => void; // Callback exécuté après une mise à jour réussie du profil.
}

/**
 * UserProfileModal est une modale qui permet de visualiser et de modifier les informations
 * d'un utilisateur, y compris son profil et son mot de passe.
 * Elle est structurée avec des onglets pour une meilleure organisation.
 */
export function UserProfileModal({ user, isOpen, onClose, onUserUpdate }: UserProfileModalProps) {
  // États pour gérer la soumission des formulaires et la visibilité des mots de passe
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // Suivi de l'onglet actif
  const { toast } = useToast()

  // Initialisation du formulaire de profil avec react-hook-form et Zod pour la validation
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
    },
  });

  // Initialisation du formulaire de mot de passe
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  })
  
  // Effet pour réinitialiser les formulaires lorsque la modale s'ouvre ou que l'utilisateur change.
  // Cela garantit que les formulaires affichent toujours les données à jour ou sont vides.
  useEffect(() => {
    if (isOpen && user) {
      // Pré-remplit le formulaire de profil avec les données de l'utilisateur
      profileForm.reset({
        prenom: user.personne?.prenom || "",
        nom: user.personne?.nom || "",
        email: user.email || "", // Ensure email is reset
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
      });
    } else if (!isOpen) {
      // Vide les formulaires lorsque la modale se ferme pour ne pas conserver d'anciennes données
      profileForm.reset();
      passwordForm.reset();
    }
  }, [user, isOpen, profileForm, passwordForm]); // `reset` est stable, pas besoin de l'inclure

  /**
   * Gère la soumission du formulaire de profil.
   * @param values - Les valeurs du formulaire validées par Zod.
   */
  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user || !user.id) {
      toast({ variant: "destructive", title: "Erreur", description: "ID utilisateur manquant pour la mise à jour." })
      return;
    }
    setIsProfileSubmitting(true);

    // Le service `updateUser` attend un objet plat, donc nous transformons les données.
    // Le `as any` est utilisé car la signature de `updateUser` peut attendre un type plus complexe,
    // mais l'API est conçue pour accepter ce format aplati pour les mises à jour partielles.
    const payload = {
      email: values.email,
      nom: values.nom,
      prenom: values.prenom,
    }

    try {
      // On envoie la requête de mise à jour à l'API.
      await updateUser(user.id, payload as any);

      // FIX: Au lieu de se fier à la réponse de l'API (qui peut être incomplète),
      // on construit nous-mêmes l'objet utilisateur mis à jour avec la bonne structure.
      // Cela garantit que l'état du composant parent est mis à jour correctement et instantanément.
      const updatedUser: User = {
        ...user, // On garde les anciennes données de l'utilisateur (rôle, etc.)
        email: values.email,
        personne: {
          ...(user.personne || {}), // On garde l'ID de la personne s'il existe
          nom: values.nom,
          prenom: values.prenom,
        },
      };

      onUserUpdate(updatedUser); // On notifie le parent avec l'objet utilisateur complet.
      onClose() // Ferme la modale en cas de succès
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour votre profil.",
      })
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  /**
   * Gère la soumission du formulaire de changement de mot de passe.
   * @param values - Les valeurs du formulaire validées par Zod.
   */
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (!user || !user.id) {
      toast({ variant: "destructive", title: "Erreur", description: "ID utilisateur manquant." })
      return;
    }
    setIsPasswordSubmitting(true);

    try {
      // Le service `updateUser` gère également la modification du mot de passe
      await updateUser(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      passwordForm.reset();
      onClose() // Ferme la modale en cas de succès
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
    } catch (error: any) {
      // Afficher un message d'erreur plus spécifique si disponible depuis le backend
      const errorMessage = error.response?.data?.message || "Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.";
      toast({ variant: "destructive", title: "Erreur de modification", description: errorMessage })
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  /**
   * Génère les initiales de l'utilisateur pour l'avatar.
   * @param prenom - Le prénom de l'utilisateur.
   * @param nom - Le nom de l'utilisateur.
   * @returns Une chaîne de deux caractères (ex: "JD" pour "John Doe").
   */
  const getInitials = (prenom?: string, nom?: string) => {
    const firstInitial = prenom?.charAt(0)?.toUpperCase() || ""
    const lastInitial = nom?.charAt(0)?.toUpperCase() || ""
    return firstInitial + lastInitial || "U"
  }

  /**
   * Détermine la couleur du badge en fonction du rôle de l'utilisateur.
   */
  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive"
      case "moderator":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* La structure de la modale est divisée en 3 parties : Header, Content, et Footer. */}
      {/* Le contenu est scrollable si la hauteur de l'écran est limitée. */}
      <DialogContent className="max-w-4xl p-0">
        <div className="flex flex-col max-h-[90vh]">
          {/* En-tête de la modale avec les informations principales de l'utilisateur */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-bold">
                  {getInitials(user?.personne?.prenom, user?.personne?.nom)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-slate-800">
                  {`${user?.personne?.prenom || ""} ${user?.personne?.nom || ""}`.trim() || user?.email}
                </DialogTitle>
                {/* La prop `asChild` sur DialogDescription permet de rendre un `div` au lieu du `p` par défaut,
                    évitant ainsi une erreur d'hydratation React car un `div` (Badge) ne peut pas être un enfant d'un `p`.
                */}
                
              </div>
            </div>
          </DialogHeader>

          {/* Contenu principal avec les onglets */}
          <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="profile" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sécurité
                  </TabsTrigger>
                </TabsList>

                {/* Onglet de gestion du profil */}
                <TabsContent value="profile" className="px-6 py-4">
                  <Form {...profileForm}>
                    <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="prenom"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Prénom
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Votre prénom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="nom"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Nom
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Adresse email
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="votre@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </TabsContent>

                {/* Onglet de gestion de la sécurité (mot de passe) */}
                <TabsContent value="security" className="px-6 py-4">
                  <Form {...passwordForm}>
                    <form id="security-form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Mot de passe actuel</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="Votre mot de passe actuel"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Votre nouveau mot de passe"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
          </div>

          {/* Pied de page de la modale avec les boutons d'action */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProfileSubmitting || isPasswordSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              form={activeTab === "profile" ? "profile-form" : "security-form"}
              disabled={isProfileSubmitting || isPasswordSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {/* Le texte et l'icône du bouton s'adaptent à l'onglet actif et à l'état de soumission */}
              {activeTab === "profile" ? (
                <><Save className="h-4 w-4 mr-2" />{isProfileSubmitting ? "Sauvegarde..." : "Sauvegarder"}</>
              ) : (
                <><Shield className="h-4 w-4 mr-2" />{isPasswordSubmitting ? "Modification..." : "Modifier"}</>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

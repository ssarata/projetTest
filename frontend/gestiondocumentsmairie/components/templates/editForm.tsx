"use client" // Directive Next.js pour indiquer que ce fichier doit être rendu côté client

import { useState, useEffect } from "react"

// Import de React Hook Form pour gérer les formulaires
import { useForm } from "react-hook-form"

// Import de Zod pour la validation de schéma
import { z } from "zod"

// Connecteur entre Zod et React Hook Form
import { zodResolver } from "@hookform/resolvers/zod"

// Hook Next.js pour la navigation côté client
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

// Import des composants UI personnalisés
import {Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Form, FormField, FormItem, FormLabel, FormControl,
  FormMessage, FormDescription
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

// Services d’API pour les modèles et variables
import {
   getTemplateById,updateTemplate
} from "@/services/DocumentTemplateService"
import {
  createVariable
} from "@/services/VariableService"

// Icônes provenant de lucide-react
import {
  FileText, Plus, ArrowLeft, Save, Eye, Sparkles, Code, 
} from "lucide-react"

// Définition du schéma de validation du formulaire avec Zod
const formSchema = z.object({
  typeDocument: z.string().min(1, "Le type de document est requis."),
  contentValue: z.string().min(1, "Le contenu est requis."),
})

// Typage TypeScript basé sur le schéma
type FormValues = z.infer<typeof formSchema>



// Composant principal
export default function UpdateTemplatePage() {
  const router = useRouter();
  const params = useParams(); // Pour récupérer l'ID du template dans l'URL
  const [variables, setVariables] = useState<{ nomVariable: string }[]>([]) // Variables en BDD
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]) // Variables trouvées dans le contenu
  const [isSubmitting, setIsSubmitting] = useState(false) // Indique si un envoi est en cours
   // État local pour le nom de la nouvelle variable à ajouter
  const [newVariableName, setNewVariableName] = useState("");

  // Initialisation du formulaire avec React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Intègre la validation Zod
    defaultValues: {
      typeDocument: "",
      contentValue: "",
    },
  })

  // Permet d’écouter les changements sur le champ contentValue
  const contentValue = form.watch("contentValue")

  // Au chargement, récupère les variables existantes depuis le localStorage OU recharge depuis le backend si édition
  useEffect(() => {
    const fetchOrRestore = async () => {
      const savedVars = localStorage.getItem("template_vars");
      const savedContent = localStorage.getItem("template_content");
      const savedType = localStorage.getItem("template_type");
      if (savedVars && savedContent && savedType) {
        setVariables(JSON.parse(savedVars));
        form.setValue("contentValue", savedContent);
        form.setValue("typeDocument", savedType);
      } else if (params?.id) {
        try {
          const data = await getTemplateById(params.id as string);
          if (data) {
            // Variables (format attendu : [{ nomVariable: string }])
            if (Array.isArray(data.variables)) {
              setVariables(data.variables.map((v: any) => ({ nomVariable: v.nomVariable })));
              localStorage.setItem("template_vars", JSON.stringify(data.variables.map((v: any) => ({ nomVariable: v.nomVariable }))));
            }
            // Type de document
            if (data.typeDocument) {
              form.setValue("typeDocument", data.typeDocument);
              localStorage.setItem("template_type", data.typeDocument);
            }
            // Contenu
            if (data.content) {
              form.setValue("contentValue", data.content);
              localStorage.setItem("template_content", data.content);
            }
          }
        } catch (e) {
          console.error("Erreur lors du chargement du template:", e);
        }
      }
    };
    fetchOrRestore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // Sauvegarde la liste des variables dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("template_vars", JSON.stringify(variables));
  }, [variables]);

  // Sauvegarde le contenu du template dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("template_content", form.getValues("contentValue"));
  }, [form.watch("contentValue")]);
//form.watch("contentValue") : Cette fonction de React Hook Form permet d’écouter la valeur du champ "contentValue" (le contenu du template) en temps réel.
  
// Sauvegarde le type de document dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("template_type", form.getValues("typeDocument"));
  }, [form.watch("typeDocument")]);


  // Ajoute une variable à la liste (et donc au localStorage)
  // Le nom de la variable est unique, pas besoin d'id
  const addVariable = () => {
    if (!newVariableName.trim()) return;
    // Vérifie l'unicité du nom de variable (insensible à la casse et aux espaces)
    const isDuplicate = variables.some(v => v.nomVariable.trim().toLowerCase() === newVariableName.trim().toLowerCase());
    if (isDuplicate) return; // N'ajoute pas si le nom existe déjà
    setVariables((prev) => [...prev, { nomVariable: newVariableName.trim() }]);
    setNewVariableName(""); // Réinitialise le champ de saisie
  };

  // Insère une variable dans le contenu du template à la position du curseur
  const insertVariable = (variableName: string) => {
    const currentContent = form.getValues("contentValue");
    const textarea = document.querySelector("textarea[name='contentValue']") as HTMLTextAreaElement;
    if (textarea && textarea.selectionStart !== undefined) {
      // Insertion à la position du curseur
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);
      const newContent = before + `{{${variableName}}}` + after;
      form.setValue("contentValue", newContent);
      // Replace le curseur juste après la variable insérée
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + `{{${variableName}}}`.length;
      }, 0);
    } else {
      // Si pas de textarea détecté, ajoute à la fin
      form.setValue("contentValue", currentContent + `{{${variableName}}}`);
    }
  };

  // À chaque changement de contenu, extrait les variables dynamiques
  useEffect(() => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = contentValue.match(regex);
    setExtractedVariables(foundVariables ? foundVariables.map(v => v.replace(/{{|}}/g, "")) : []);
  }, [contentValue]);

  // Ajoute ou modifie une variable dans la liste (et donc au localStorage)
  const upsertVariable = (oldName: string | null, newName: string) => {
    if (!newName.trim()) return;
    // Vérifie l'unicité du nom de variable (insensible à la casse et aux espaces)
    const isDuplicate = variables.some(v => v.nomVariable.trim().toLowerCase() === newName.trim().toLowerCase() && v.nomVariable !== oldName);
    if (isDuplicate) return;
    if (oldName) {
      // Modification d'une variable existante
      setVariables((prev) => prev.map(v => v.nomVariable === oldName ? { nomVariable: newName.trim() } : v));
    } else {
      // Ajout d'une nouvelle variable
      setVariables((prev) => [...prev, { nomVariable: newName.trim() }]);
    }
    setNewVariableName("");
  };

  // Effet pour charger les données du backend si édition (ID présent dans l'URL)
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!params?.id) return;
      // Vérifie si le localStorage est vide (pas d'édition en cours)
      const savedVars = localStorage.getItem("template_vars");
      const savedContent = localStorage.getItem("template_content");
      const savedType = localStorage.getItem("template_type");
      if (!savedVars && !savedContent && !savedType) {
        try {
          const data = await getTemplateById(params.id as string);
          if (data) {
            // Variables (format attendu : [{ nomVariable: string }])
            if (Array.isArray(data.variables)) {
              setVariables(data.variables.map((v: any) => ({ nomVariable: v.nomVariable })));
              localStorage.setItem("template_vars", JSON.stringify(data.variables.map((v: any) => ({ nomVariable: v.nomVariable }))));
            }
            // Type de document
            if (data.typeDocument) {
              form.setValue("typeDocument", data.typeDocument);
              localStorage.setItem("template_type", data.typeDocument);
            }
            // Contenu
            if (data.content) {
              form.setValue("contentValue", data.content);
              localStorage.setItem("template_content", data.content);
            }
          }
        } catch (e) {
          // Gérer l'erreur de chargement
          console.error("Erreur lors du chargement du template:", e);
        }
      }
    };
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // À la soumission, insérer les variables et le template, puis nettoyer le localStorage
  const onSubmit = async (values: FormValues) => {
    try {
     
      for (const variable of variables) {
        await createVariable(variable.nomVariable); // À remplacer par updateVariable/patchVariable si tu as une API dédiée
      }
      const data = {
        typeDocument: values.typeDocument,
        content: values.contentValue,
      };
      // Utilisation de l'ID pour la modification du template
      const response = await updateTemplate(params.id as string, data);
        if (response.status === 200) {
        form.reset();
        setVariables([]);
        localStorage.removeItem("template_vars");
        localStorage.removeItem("template_content");
        localStorage.removeItem("template_type");
        router.push("/templates/index");
      }

    
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      form.setError("typeDocument", {
        message: "Une erreur est survenue lors de l'enregistrement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Rendu JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-10 px-4 max-w-6xl">

        {/* Bouton de retour */}
        <Button onClick={() => router.push("/templates/index")} variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux modèles
        </Button>

        {/* Titre */}
        <div className="flex items-center gap-4 mb-4">
         
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Modifier un template</h1>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>


                  <CardContent className="p-8 space-y-6">
                    {/* Champ : typeDocument */}
                    <FormField
                      control={form.control}
                      name="typeDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex : Certificat de naissance" />
                          </FormControl>
                          <FormDescription>Nom unique pour identifier ce type de document</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Champ : contentValue */}
                    <FormField
                      control={form.control}
                      name="contentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu du modèle</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Utilisez {{variable}} pour insérer une variable" />
                          </FormControl>
                          <FormDescription><Code className="h-4 w-4" /></FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                
                  </CardContent>

                  {/* Boutons Enregistrer / Aperçu */}
                  <CardFooter className="flex gap-3 p-8 pt-0">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Modifier
                        </>
                      )}
                    </Button>
                  
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* Variables disponibles */}
            <Card>
              <CardHeader>
                <CardTitle><Sparkles className="h-5 w-5 text-blue-600" /> Variables disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => { e.preventDefault(); addVariable(); }} className="flex gap-2 mb-4">
                  <Input
                    value={newVariableName}
                    onChange={e => setNewVariableName(e.target.value)}
                    placeholder="Nom de la variable"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="default">Ajouter</Button>
                </form>
                {variables.length > 0 ? (
                  variables.map((variable) => (
                    <div key={variable.nomVariable} className="flex justify-between items-center gap-2">
                      <Input
                        className="w-auto flex-1"
                        value={variable.nomVariable}
                        onChange={e => upsertVariable(variable.nomVariable, e.target.value)}
                        onBlur={e => {
                          // Si le nom a changé, mettre à jour la variable côté backend
                          if (variable.nomVariable !== e.target.value.trim()) {
                            // Appel API pour modifier la variable existante
                            createVariable(e.target.value.trim()); // À remplacer par updateVariable si tu as une API dédiée
                          }
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => insertVariable(variable.nomVariable)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500">Aucune variable disponible</div>
                )}
              </CardContent>
            </Card>

            

          
          </div>
        </div>
      </div>
    </div>
  )
}

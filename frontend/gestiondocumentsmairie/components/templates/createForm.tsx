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

// Import des composants UI personnalisés
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
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
  createTemplate, checkTypeDocumentUnique, archiveTemplate, restoreTemplate, forceDeleteTemplate, getTemplateById
} from "@/services/DocumentTemplateService"
import { fetchVariables, createVariable } from "@/services/VariableService"
import { toast } from "@/hooks/use-toast"

// Icônes provenant de lucide-react
import {
  FileText, Plus, ArrowLeft, Save, Eye, AlertCircle, Sparkles, Code, Lightbulb
} from "lucide-react"

// Définition du schéma de validation du formulaire avec Zod
const formSchema = z.object({
  typeDocument: z.string().min(1, "Le type de document est requis."),
  contentValue: z.string().min(1, "Le contenu est requis."),
})

// Typage TypeScript basé sur le schéma
type FormValues = z.infer<typeof formSchema>



// Composant principal
export default function CreateTemplatePage() {
  const router = useRouter()
  const [variables, setVariables] = useState<{ nomVariable: string }[]>([])
  const [dbVariables, setDbVariables] = useState<{ nomVariable: string }[]>([])
  const [variableError, setVariableError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false) // Indique si un envoi est en cours
   // État local pour le nom de la nouvelle variable à ajouter
  const [newVariableName, setNewVariableName] = useState("");
  const [isClient, setIsClient] = useState(false); // Ajouté
  // Liste des types de document existants (depuis la base)
  const [dbTypes, setDbTypes] = useState<string[]>([]);

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

  // Au chargement, récupère les variables existantes depuis le localStorage
  useEffect(() => {
    setIsClient(true); // On indique que le composant est monté côté client
    const savedVars = localStorage.getItem("template_vars");
    const savedContent = localStorage.getItem("template_content");
    const savedType = localStorage.getItem("template_type");
    if (savedVars) setVariables(JSON.parse(savedVars));
    if (savedContent) form.setValue("contentValue", savedContent);
    if (savedType) form.setValue("typeDocument", savedType);
    // Charger les variables existantes en base
    fetchVariables().then(setDbVariables).catch(() => setDbVariables([]));
    // Récupérer tous les types de document existants
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => setDbTypes(data.map((t: any) => t.typeDocument?.toLowerCase?.() || "")))
      .catch(() => setDbTypes([]));
  }, []);

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
    setVariableError("");
    if (!newVariableName.trim()) return;
    const name = newVariableName.trim().toLowerCase();
    const isDuplicateLocal = variables.some(v => v.nomVariable.trim().toLowerCase() === name);
    const isDuplicateDb = dbVariables.some(v => v.nomVariable.trim().toLowerCase() === name);
    if (isDuplicateLocal || isDuplicateDb) {
      toast({
        title: "Erreur variable",
        description: "Cette variable existe déjà (en base ou dans la liste). Choisissez un autre nom.",
        variant: "destructive"
      });
      setVariableError("Cette variable existe déjà (en base ou dans la liste). Choisissez un autre nom.");
      return;
    }
    setVariables((prev) => [...prev, { nomVariable: newVariableName.trim() }]);
    setNewVariableName("");
    toast({
      title: "Variable ajoutée",
      description: `La variable '${newVariableName.trim()}' a été ajoutée à la liste.`,
      variant: "default"
    });
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

  const handleTypeDocumentBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const typeDocument = e.target.value.trim();
    if (!typeDocument) {
      form.clearErrors("typeDocument");
      return;
    }

    try {
      const isUnique = await checkTypeDocumentUnique(typeDocument);
      if (!isUnique) {
        form.setError("typeDocument", {
          type: "manual",
          message: "Ce type de document existe déjà.",
        });
      } else {
        form.clearErrors("typeDocument");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du type de document:", error);
    }
  };
 

  // À la soumission, insérer les variables et le template, puis nettoyer le localStorage
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setVariableError("");
     
      for (const variable of variables) {
        try {
          await createVariable(variable.nomVariable);
        } catch (error: any) {
          if (
            typeof error === "string" && error.includes("existe déjà")
            || error?.response?.data?.message?.includes("existe déjà")
          ) {
            // ignore
          } else {
            toast({
              title: "Erreur lors de la création d'une variable",
              description: "Veuillez vérifier les noms de vos variables.",
              variant: "destructive"
            });
            setVariableError("Erreur lors de la création d'une variable. Veuillez vérifier les noms.");
            throw error;
          }
        }
      }
      const data = {
        typeDocument: values.typeDocument,
        content: values.contentValue,
      };
      const response = await createTemplate(data);
      if (response.status === 201) {
        toast({
          title: "Modèle créé",
          description: "Le modèle a bien été enregistré.",
          variant: "default"
        });
        form.reset();
        setVariables([]);
        localStorage.removeItem("template_vars");
        localStorage.removeItem("template_content");
        localStorage.removeItem("template_type");
        router.push("/templates/index");
      }
    } catch (error: any) {
      if (error?.response?.status === 500 && error?.response?.data?.message?.includes("existe déjà")) {
        toast({
          title: "Erreur serveur",
          description: "Ce type de document existe déjà (erreur serveur).",
          variant: "destructive"
        });
        form.setError("typeDocument", { message: "Ce type de document existe déjà (erreur serveur)." });
      } else {
        toast({
          title: "Erreur lors de l'enregistrement",
          description: "Une erreur est survenue lors de l'enregistrement.",
          variant: "destructive"
        });
        form.setError("typeDocument", {
          message: "Une erreur est survenue lors de l'enregistrement.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Rendu JSX
  if (!isClient) return null; // Empêche le rendu SSR du formulaire

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
            <h1 className="text-3xl font-bold text-slate-900">Créer un nouveau template</h1>
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
                            <Input {...field} placeholder="Ex : Certificat de naissance" onBlur={handleTypeDocumentBlur} />
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
                          Enregistrer
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
                    onChange={e => { setNewVariableName(e.target.value); setVariableError(""); }}
                    placeholder="Nom de la variable"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="default">Ajouter</Button>
                </form>
                {variableError && (
                  <div className="text-red-500 text-sm mb-2">{variableError}</div>
                )}
                {variables.length > 0 ? (
                  variables.map((variable) => (
                    <div key={variable.nomVariable} className="flex justify-between items-center">
                      <span>{variable.nomVariable}</span>
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

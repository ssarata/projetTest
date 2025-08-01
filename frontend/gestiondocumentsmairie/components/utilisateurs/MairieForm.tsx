"use client";

import { useState } from "react";
import mairieService, { Mairie } from "@/services/mairie";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface MairieFormProps {
  mairie: Mairie;
  mairieId: number;
  onClose: () => void;
  onSuccess: (updatedMairie: Mairie) => void;
}

// Définir un schéma pour la validation avec Zod
const formSchema = z.object({
  ville: z.string().min(1, "La ville est requise."),
  commune: z.string().min(1, "La commune est requise."),
  region: z.string().min(1, "La région est requise."),
  prefecture: z.string().min(1, "La préfecture est requise."),
  logo: z.any().optional(), // Utiliser z.any() pour les champs de type fichier
});

type FormValues = z.infer<typeof formSchema>;

export default function MairieForm({ mairie, mairieId, onClose, onSuccess }: MairieFormProps) {
  // Initialiser le formulaire avec react-hook-form et le validateur Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ville: mairie.ville || "",
      commune: mairie.commune || "",
      region: mairie.region || "",
      prefecture: mairie.prefecture || "",
      logo: undefined, // Ne pas pré-remplir le champ fichier
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Gérer l'aperçu du logo
  const [logoPreview, setLogoPreview] = useState<string | null>(
    mairie.logo ? `http://localhost:3000/api/mairies/uploads/${mairie.logo}` : null
  );

  // Mettre à jour l'aperçu quand un nouveau fichier est sélectionné
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Si la sélection est annulée, revenir au logo original
      setLogoPreview(mairie.logo ? `http://localhost:3000/api/mairies/uploads/${mairie.logo}` : null);
    }
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);

    // Utiliser FormData pour envoyer les données, y compris le fichier
    const formData = new FormData();
    formData.append("ville", data.ville);
    formData.append("commune", data.commune);
    formData.append("region", data.region);
    formData.append("prefecture", data.prefecture);

    // Ajouter le fichier logo seulement s'il a été modifié
    if (data.logo && data.logo.length > 0) {
      formData.append("logo", data.logo[0]);
    }

    try {
      // Le service `mairieService.update` doit être capable d'envoyer des FormData
      const updatedMairie = await mairieService.update(mairieId, formData);
      onSuccess(updatedMairie);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.");
      console.error("Erreur mise à jour :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">Modifier les Informations</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Aperçu du logo */}
            <div className="flex justify-center">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Aperçu du logo"
                  width={100}
                  height={100}
                  className="rounded-full object-cover border-4 border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-400" />
                </div>
              )}
            </div>

            {/* Champs du formulaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input placeholder="Sokodé" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commune</FormLabel>
                    <FormControl>
                      <Input placeholder="Tchaoudjo 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <FormControl>
                      <Input placeholder="Centrale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prefecture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Préfecture</FormLabel>
                    <FormControl>
                      <Input placeholder="Tchaoudjo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Champ pour uploader le logo */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Changer le logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handleLogoChange(e);
                      }}
                    />
                  </FormControl>
                  {mairie.logo && (
                    <FormDescription className="text-sm text-gray-500 mt-1">
                      Logo actuel : {mairie.logo}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <CardFooter className="flex justify-end gap-3 p-0 pt-4">
              <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md transition-all duration-200 gap-2"
              >
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

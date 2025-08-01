"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Download, FileText,  Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchDocumentPersonnesByDocumentId } from "@/services/DocumentPersonneService"
import { Skeleton } from "@/components/ui/skeleton"
import { format as formatDateFns } from "date-fns"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import mairieService, { Mairie } from "@/services/mairie"
import { useToast } from "@/components/ui/use-toast"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [doc, setDoc] = useState<any[] | null>(null) // doc is an array of DocumentPersonne
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [mairie, setMairie] = useState<Mairie | null>(null)
  const [mairieId, setMairieId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const documentId = String(params.id)

  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true)
      try {
        // Remplacement : on récupère les personnes liées au document
        const res = await fetchDocumentPersonnesByDocumentId(Number(documentId))
        setDoc(res || null)
      } catch (error) {
        setDoc(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoc()
  }, [documentId])

  useEffect(() => {
    const fetchMairie = async () => {
      setError(null)
      setLoading(true)
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
      }
    }
    fetchMairie()
  }, [])

  useEffect(() => {
    if (!mairie?.logo) return

    let objectUrl: string
    const fetchLogo = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Token non trouvé pour charger le logo")
        return
      }
      try {
        const response = await fetch(`http://localhost:3000/api/mairies/uploads/${mairie.logo}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const blob = await response.blob()
          objectUrl = URL.createObjectURL(blob)
          setLogoUrl(objectUrl)
        }
      } catch (error) {
        console.error("Erreur lors du chargement du logo:", error)
      }
    }

    fetchLogo()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mairie])

  function replacePlaceholders(content: string, docPersonnes: any[] = []) {
    if (!content) return "";
    if (!Array.isArray(docPersonnes)) docPersonnes = [];
    return content.replace(/{{(.*?)}}/g, (_match, placeholder) => {
      // On cherche la DocumentPersonne dont la fonction correspond à la variable du template
      const docPers = docPersonnes.find(dp => dp.fonction === placeholder.trim());
      if (docPers && docPers.personne) {
        // Si la fonction contient un point (ex: papa.nom), on prend la propriété après le point
        if (docPers.fonction.includes(".")) {
          const prop = docPers.fonction.split(".")[1];
          return docPers.personne[prop] ?? "---";
        } else {
          // Sinon, on retourne nom + prénom par défaut
          return `${docPers.personne.nom} ${docPers.personne.prenom}`;
        }
      }
      return "---";
    });
  }

  // Fonction utilitaire pour extraire les personnes concernées à partir du tableau de documentPersonne
  function getPersonnesFromDocumentPersonnes(docPersonnes: any[] = []) {
    if (!Array.isArray(docPersonnes)) return [];
    // On retourne la liste des personnes distinctes liées au document
    const ids = new Set();
    return docPersonnes
      .map(dp => dp.personne)
      .filter(p => {
        if (!p || ids.has(p.id)) return false;
        ids.add(p.id);
        return true;
      });
  }

  const personnes = getPersonnesFromDocumentPersonnes(doc || []);
  
  const handleGeneratePdf = async () => {
    if (!documentId) return;
    setIsPdfGenerating(true);

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Token non trouvé. Veuillez vous reconnecter.",
        })
        setIsPdfGenerating(false)
        return
      }
      // Appel direct de l'API pour générer le PDF
      const response = await fetch(`/api/documents/${Number(documentId)}/latex-pdf`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erreur du serveur: ${response.statusText}` }));
        throw new Error(errorData.error || `La génération du PDF a échoué (status: ${response.status}).`);
      }

      // Gestion du téléchargement du fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
        console.error("Erreur lors de la génération du PDF:", error);
        toast({
          variant: "destructive",
          title: "Échec de la génération du PDF",
          description: error.message || "Une erreur inattendue est survenue.",
        })
    } finally {
        setIsPdfGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDateFns(new Date(dateString), "d MMMM yyyy", { locale: fr })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" className="mb-6" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>

        <Card className="shadow-md">
          <CardHeader className="animate-pulse bg-gray-100">
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
            <div className="text-center">
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-6 w-48 ml-auto" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-32" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-6">
          <div className="bg-red-50 text-red-800 p-6 rounded-lg inline-flex items-center">
            <FileText className="h-12 w-12 mr-4 text-red-500" />
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">Document non trouvé</h1>
              <p className="text-gray-600 mb-4">Le document que vous recherchez n'existe pas ou a été supprimé.</p>
            </div>
          </div>
          <Button onClick={() => router.push("/documents")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste des documents
          </Button>
        </div>
      </div>
    )
  }

  // Récupération des infos mairie dynamiques
  const mairieInfos = Array.isArray(doc) && doc.length > 0 ? doc[0].document?.mairie || {} : {};
  const nomCommune = mairieInfos.commune || "-";
  const nomPrefecture = mairieInfos.prefecture || "-";
  const nomRegion = mairieInfos.region || "-";

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/documents")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/documents/${documentId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
         
          <Button variant="default" size="sm" onClick={handleGeneratePdf} disabled={isPdfGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isPdfGenerating ? "Génération..." : "Télécharger PDF"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
       

        {/* Document principal */}
        <div className="md:col-span-3">
          <Card className="shadow-md print:shadow-none" id="document-to-print">
            <CardContent className="p-6 md:p-8">
              {/* En-tête structuré */}
              <div className="flex justify-between items-start mb-8">
                {/* Informations statiques à gauche */}
                <div className="text-left">
                  <p className="font-bold">MINISTERE DE L'ADMINISTRATION TERRITORIALE</p>
                  <p>DE LA DECENTRALISATION ET DU DEVELOPPEMENT</p>
                  <p>DES TERRITOIRES</p>
                  <p className="mt-4 font-bold">REGION {mairie?.region || "-"}</p>
                  <p>COMMUNE DE {mairie?.commune || "-"}</p>
                  <p className="mt-4">N° {Array.isArray(doc) && doc.length > 0 ? doc[0].documentId : "-"} /CT1</p>
                </div>

                {/* Informations de la République Togolaise à droite */}
                <div className="text-right">
                  <p className="font-bold">REPUBLIQUE TOGOLAISE</p>
                  <p>Travail - Liberté - Patrie</p>
                  <div className="mt-4">
                    {mairie?.logo && logoUrl && (
                      <img
                        src={logoUrl}
                        alt={`Logo de la mairie de ${mairie.ville}`}
                        width={80}
                        height={80}
                        className="ml-auto"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Type de document centré */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wide">
                  {Array.isArray(doc) && doc.length > 0
                    ? doc[0].document?.template?.typeDocument 
                    : "Sans titre"}
                </h1>
              </div>

              {/* Contenu du document */}
              <div className="mt-6 bg-gray-50 p-6 rounded-md border border-gray-100 leading-relaxed">
                <div className="prose prose-slate max-w-none">
                  {Array.isArray(doc) && doc.length > 0
                    ? replacePlaceholders(
                        doc[0].document?.template?.content || "",
                        doc // on passe tout le tableau de documentPersonne
                      )
                    : "Sans contenu"}
                </div>
              </div>

              <div className="mt-8 text-right">
                <p>Sokodé, le {doc && doc.length > 0 ? formatDate(doc[0].document?.date) : ""}</p>
                <p className="mt-2 italic">Pour le Maire P.O</p>
                <div className="mt-12">
                  <p className="font-bold">Le Maire</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
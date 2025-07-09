"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Download, FileText, Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchDocumentPersonnesByDocumentId } from "@/services/DocumentPersonneService"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [doc, setDoc] = useState<any>(null)

  const documentId = String(params.id)

  useEffect(() => {
    const fetchDoc = async () => {
      setIsLoading(true)
      try {
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

  // Remplacement des variables dynamiques UNIQUEMENT pour l'affichage à l'écran
  function replacePlaceholders(content: string, docPersonnes: any[] = []) {
    if (!content) return "";
    if (!Array.isArray(docPersonnes)) docPersonnes = [];
    return content.replace(/{{(.*?)}}/g, (_match, placeholder) => {
      const docPers = docPersonnes.find(dp => dp.fonction === placeholder.trim());
      if (docPers && docPers.personne) {
        if (docPers.fonction.includes(".")) {
          const prop = docPers.fonction.split(".")[1];
          return docPers.personne[prop] ?? "---";
        } else {
          return `${docPers.personne.nom} ${docPers.personne.prenom}`;
        }
      }
      // Pour l'affichage, tu peux ajouter ici un remplacement simple pour les variables mairie si tu veux
      if (placeholder === "mairie.nom") return "Commune de Tchaoudjo 1";
      if (placeholder === "mairie.region") return "Région Centrale";
      if (placeholder === "mairie.ville") return "Sokodé";
      if (placeholder === "mairie.prefecture") return "Tchaoudjo";
      return "---";
    });
  }

  // Génération PDF : appel API LaTeX uniquement
  const generatePDF = async () => {
    if (!doc) return;
    setIsPdfGenerating(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/latex-pdf`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });
      if (!response.ok) {
        let errorMsg = "Erreur lors de la génération du PDF";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const title = Array.isArray(doc) && doc.length > 0 ? doc[0].document?.template?.typeDocument || "Document" : "Document";
      link.download = `${title.replace(/\s+/g, "_")}_${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: fr })
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
          <Button variant="default" size="sm" onClick={generatePDF} disabled={isPdfGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isPdfGenerating ? "Génération..." : "Télécharger PDF"}
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card className="shadow-md print:shadow-none" id="document-to-print">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="text-left">
                  <p className="font-bold">MINISTERE DE L'ADMINISTRATION TERRITORIALE</p>
                  <p>DE LA DECENTRALISATION ET DU DEVELOPPEMENT</p>
                  <p>DES TERRITOIRES</p>
                  <p className="mt-4 font-bold">REGION CENTRALE</p>
                  <p>COMMUNE DE TCHAOUDJO 1</p>
                  <p className="mt-4">N° 4520 /CT1</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">REPUBLIQUE TOGOLAISE</p>
                  <p>Travail - Liberté - Patrie</p>
                  <div className="mt-4">
                    <Image src="/images/logo.png" alt="Logo de la Mairie" width={80} height={80} className="ml-auto" />
                  </div>
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wide">
                  {doc && doc.length > 0 ? doc[0].document?.template?.typeDocument : "Sans titre"}
                </h1>
              </div>
              <div className="mt-6 bg-gray-50 p-6 rounded-md border border-gray-100 leading-relaxed">
                <div className="prose prose-slate max-w-none">
                  {doc && doc.length > 0
                    ? replacePlaceholders(
                        doc[0].document?.template?.content || "",
                        doc
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
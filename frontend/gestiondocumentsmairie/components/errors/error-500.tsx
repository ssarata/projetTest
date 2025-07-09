"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Error500Props } from "@/types/erros"


export default function Error500({
  title = "Erreur serveur",
  description = "Une erreur inattendue s'est produite sur le serveur. Veuillez réessayer plus tard.",
  onRetry,
  onReport,
  errorId,
}: Error500Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">500</CardTitle>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
          {errorId && <CardDescription className="text-xs text-gray-500 mt-2">ID d'erreur: {errorId}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={onRetry || (() => window.location.reload())} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            {onReport && (
              <Button variant="outline" onClick={onReport} className="w-full bg-white">
                Signaler le problème
              </Button>
            )}
            <Button variant="ghost" onClick={() => (window.location.href = "/")} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

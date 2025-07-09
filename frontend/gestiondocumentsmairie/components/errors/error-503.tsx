"use client"

import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Error503Props } from "@/types/erros"


export default function Error503({
  title = "Service temporairement indisponible",
  description = "Le service est actuellement en maintenance. Veuillez réessayer dans quelques minutes.",
  onRetry,
  estimatedTime,
}: Error503Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">503</CardTitle>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
          {estimatedTime && (
            <CardDescription className="text-sm text-gray-500 mt-2">Temps estimé: {estimatedTime}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={onRetry || (() => window.location.reload())} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/")} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

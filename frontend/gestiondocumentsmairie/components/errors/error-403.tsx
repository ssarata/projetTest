"use client"

import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Error403Props } from "@/types/erros"

export default function Error403({
  title = "Accès interdit",
  description = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
  onRetry,
  onContact,
}: Error403Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <ShieldX className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">403</CardTitle>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {onContact && (
              <Button onClick={onContact} className="w-full">
                Contacter l'administrateur
              </Button>
            )}
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="w-full bg-white">
                Réessayer
              </Button>
            )}
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

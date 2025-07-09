"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Error401Props } from "@/types/erros"



export default function Error401({
  title = "Accès non autorisé",
  description = "Vous devez vous connecter pour accéder à cette ressource.",
  onRetry,
  onLogin,
}: Error401Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">401</CardTitle>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {onLogin && (
              <Button onClick={onLogin} className="w-full">
                Se connecter
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

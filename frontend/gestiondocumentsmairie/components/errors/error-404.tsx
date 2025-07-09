"use client"

import { Search, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Error404Props } from "@/types/erros"


export default function Error404({
  title = "Page non trouvée",
  description = "La page que vous recherchez n'existe pas ou a été déplacée.",
  onHome,
  onSearch,
}: Error404Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">404</CardTitle>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={onHome || (() => (window.location.href = "/"))} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            {onSearch && (
              <Button variant="outline" onClick={onSearch} className="w-full bg-white">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
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

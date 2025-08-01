"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Tu peux loguer l’erreur ici si besoin
    // console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 dark:from-red-900 dark:to-slate-900 p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">Une erreur est survenue</h1>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Désolé, une erreur inattendue s’est produite.<br />
            Veuillez réessayer ou contacter l’administrateur si le problème persiste.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => reset()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Retour à l’accueil
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
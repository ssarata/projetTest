"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, Lock, Home } from "lucide-react"
import { motion } from "framer-motion"

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Accès interdit
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Vous n’avez pas les droits nécessaires pour accéder à cette page.<br />
            Veuillez contacter un administrateur si vous pensez qu’il s’agit d’une erreur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
            <Button onClick={() => window.location.href = "/dashboard"}>
              <Home className="w-4 h-4 mr-2" />
              Retour à l’accueil
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
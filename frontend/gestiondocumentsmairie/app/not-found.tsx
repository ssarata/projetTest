"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-6xl font-bold text-orange-600 dark:text-orange-400 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Page introuvable
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Désolé, la page que vous cherchez n’existe pas ou a été déplacée.<br />
            Vérifiez l’URL ou revenez à l’accueil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Page précédente
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              <Home className="w-4 h-4 mr-2" />
              Retour à l’accueil
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
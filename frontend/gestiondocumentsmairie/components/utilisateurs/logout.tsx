'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Supprimer le token (ou tout autre élément lié à l'auth)
    localStorage.removeItem('token')

    // Rediriger l'utilisateur vers la page de connexion
    router.push('/utilisateurs/login')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-700 text-lg">Déconnexion en cours...</p>
    </div>
  )
}

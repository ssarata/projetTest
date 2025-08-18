"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TemplatesPage from "@/components/templates"
import { getCurrentUser } from "@/services/userService"
import  {Role}  from "@/types/LoginResponse" // adapte le chemin selon ton projet

export default function listeTemplates() {
  // console.log("Composant monté") 

  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // console.log("useEffect lancé") 
    async function checkRole() {
      try {
        const user = await getCurrentUser()
        console.log("Role utilisateur :", user.role) // Ajoute ce log
        if (user.role !== Role.ADMIN) {
          router.replace("/403")
        } else {
          setAuthorized(true)
        }
      } catch {
        router.replace("/403")
      } finally {
        setLoading(false)
      }
    }
    checkRole()
  }, [router])

  if (loading) return null
  if (!authorized) return null
  return (
    <div>
      <TemplatesPage />
    </div>
  )
}
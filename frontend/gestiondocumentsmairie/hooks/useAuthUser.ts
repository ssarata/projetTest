// hooks/useAuthUser.ts
import { useEffect, useState } from "react"
import { decodeToken, DecodedToken } from "@/utils/decodeToken"
import { getUserById } from "@/services/UserService"
import { User } from "@/types/LoginResponse"

export const useAuthUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    const decoded = decodeToken(token)
    if (!decoded) {
      setLoading(false)
      return
    }

    getUserById(decoded.userId, token)
      .then((userData) => {
        setUser(userData)
      })
      .catch((err) => {
        console.error("Erreur de récupération de l'utilisateur :", err)
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

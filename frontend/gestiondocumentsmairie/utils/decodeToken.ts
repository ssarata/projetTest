// utils/decodeToken.ts
import jwt_decode from "jwt-decode"

export interface DecodedToken {
  userId: string
  email: string
  iat: number
  exp: number
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt_decode<DecodedToken>(token)
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error)
    return null
  }
}

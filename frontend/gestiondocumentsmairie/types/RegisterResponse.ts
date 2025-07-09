// types/RegisterResponse.ts

export interface RegisterResponse {
  token: string
  user: {
    id: string
    nom: string
    prenom: string
    email: string

  }
}

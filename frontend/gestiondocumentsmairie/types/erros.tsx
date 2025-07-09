export interface Error401Props {
  title?: string
  description?: string
  onRetry?: () => void//surReessayer
  onLogin?: () => void//surConnexion
}

export interface Error403Props {
  title?: string
  description?: string
  onRetry?: () => void//surReessayer
  onContact?: () => void//surContact
}
export interface Error404Props {
  title?: string
  description?: string
  onHome?: () => void//surAccueil
  onSearch?: () => void//surRecherche
}

 export interface Error500Props {
  title?: string
  description?: string
  onRetry?: () => void
  onReport?: () => void //surSignaler
  errorId?: string
}
 export interface Error503Props {
  title?: string
  description?: string
  onRetry?: () => void
  estimatedTime?: string//surTempsEstime
}


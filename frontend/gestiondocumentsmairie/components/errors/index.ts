export { default as Error401 } from "./error-401"
export { default as Error403 } from "./error-403"
export { default as Error404 } from "./error-404"
export { default as Error500 } from "./error-500"
export { default as Error503 } from "./error-503"
export { default as GenericError } from "./generic-error"
export { default as ErrorBoundary } from "./error-boundary"

// Utility function to get the appropriate error component
export const getErrorComponent = (statusCode: number) => {
  switch (statusCode) {
    case 401:
      return Error401
    case 403:
      return Error403
    case 404:
      return Error404
    case 500:
      return Error500
    case 503:
      return Error503
    default:
      return GenericError
  }
}

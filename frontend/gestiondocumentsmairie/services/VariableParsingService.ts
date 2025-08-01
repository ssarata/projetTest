/**
 * Service pour analyser et gérer les variables dynamiques dans les templates
 * Ce service permet de comprendre le type de variable et de remplacer les placeholders
 */

// Interface pour représenter une variable analysée
export interface ParsedVariable {
  fullName: string // Nom complet de la variable (ex: "nom de maman")
  fieldType: string // Type de champ (ex: "nom", "profession", "adresse")
  description: string // Description du rôle (ex: "de maman", "de la mariée")
  isPersonField: boolean // Indique si c'est un champ de personne
}

// Interface pour les champs de personne disponibles
export interface PersonField {
  key: string
  label: string
  type: "text" | "email" | "tel" | "date"
}

/**
 * Liste des champs disponibles pour une personne
 * Utilisé pour valider et afficher les types de champs
 */
export const PERSON_FIELDS: PersonField[] = [
  { key: "nom", label: "Nom", type: "text" },
  { key: "prenom", label: "Prénom", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "telephone", label: "Téléphone", type: "tel" },
  { key: "adresse", label: "Adresse", type: "text" },
  { key: "profession", label: "Profession", type: "text" },
  { key: "nationalite", label: "Nationalité", type: "text" },
  { key: "dateNaissance", label: "Date de naissance", type: "date" },
  { key: "lieuNaissance", label: "Lieu de naissance", type: "text" },
]

/**
 * Analyse une variable pour déterminer son type et sa description
 * @param variableName - Le nom de la variable (ex: "nom de maman")
 * @returns ParsedVariable - Objet contenant les informations analysées
 */
export function parseVariable(variableName: string): ParsedVariable {
  // Nettoyer la variable (supprimer les espaces en début/fin)
  const cleanName = variableName.trim()

  // Diviser la variable en mots
  const words = cleanName.split(" ")

  // Le premier mot est considéré comme le type de champ
  const firstWord = words[0].toLowerCase()

  // Le reste constitue la description du rôle
  const description = words.slice(1).join(" ")

  // Vérifier si le premier mot correspond à un champ de personne
  const isPersonField = PERSON_FIELDS.some((field) => field.key.toLowerCase() === firstWord)

  return {
    fullName: cleanName,
    fieldType: firstWord,
    description: description || "général",
    isPersonField,
  }
}

/**
 * Extrait toutes les variables d'un contenu de template
 * @param content - Le contenu du template avec les variables {{}}
 * @returns ParsedVariable[] - Liste des variables analysées
 */
export function extractVariablesFromContent(content: string): ParsedVariable[] {
  // Expression régulière pour trouver toutes les variables {{...}}
  const regex = /{{(.*?)}}/g
  const variables: ParsedVariable[] = []
  let match

  // Parcourir toutes les correspondances
  while ((match = regex.exec(content)) !== null) {
    const variableName = match[1].trim()

    // Éviter les doublons
    if (!variables.some((v) => v.fullName === variableName)) {
      variables.push(parseVariable(variableName))
    }
  }

  return variables
}

/**
 * Récupère la valeur d'un champ spécifique d'une personne
 * @param person - L'objet personne
 * @param fieldType - Le type de champ à récupérer
 * @returns string - La valeur du champ ou une chaîne vide
 */
export function getPersonFieldValue(person: any, fieldType: string): string {
  if (!person) return ""

  // Normaliser le type de champ
  const normalizedFieldType = fieldType.toLowerCase()

  // Mapper les champs selon leur type
  switch (normalizedFieldType) {
    case "nom":
      return person.nom || ""
    case "prenom":
      return person.prenom || ""
    case "email":
      return person.email || ""
    case "telephone":
      return person.telephone || ""
    case "adresse":
      return person.adresse || ""
    case "profession":
      return person.profession || ""
    case "nationalite":
      return person.nationalite || ""
    case "datenaissance":
      return person.dateNaissance ? new Date(person.dateNaissance).toLocaleDateString("fr-FR") : ""
    case "lieunaissance":
      return person.lieuNaissance || ""
    case "nomcomplet":
      return `${person.prenom || ""} ${person.nom || ""}`.trim()
    default:
      return ""
  }
}

/**
 * Remplace les variables dans le contenu par les vraies valeurs
 * @param content - Le contenu avec les variables
 * @param documentPersonnes - Les associations document-personne
 * @returns string - Le contenu avec les variables remplacées
 */
export function replaceVariablesInContent(content: string, documentPersonnes: any[]): string {
  if (!content || !documentPersonnes || documentPersonnes.length === 0) {
    return content
  }

  let processedContent = content

  // Parcourir chaque association document-personne
  documentPersonnes.forEach((dp) => {
    if (dp.fonction && dp.personne) {
      // Analyser la variable pour comprendre son type
      const parsedVar = parseVariable(dp.fonction)

      // Récupérer la valeur appropriée selon le type de champ
      let value = ""
      if (parsedVar.isPersonField) {
        value = getPersonFieldValue(dp.personne, parsedVar.fieldType)
      } else {
        // Pour les variables non reconnues, utiliser le nom complet par défaut
        value = `${dp.personne.prenom} ${dp.personne.nom}`
      }

      // Remplacer toutes les occurrences de cette variable
      const placeholder = `{{${dp.fonction}}}`
      processedContent = processedContent.replace(new RegExp(placeholder, "g"), value)
    }
  })

  return processedContent
}

/**
 * Génère un libellé d'affichage intelligent pour une variable
 * @param parsedVar - La variable analysée
 * @returns string - Le libellé à afficher
 */
export function getVariableDisplayLabel(parsedVar: ParsedVariable): string {
  if (parsedVar.isPersonField) {
    // Trouver le champ correspondant pour avoir le bon libellé
    const field = PERSON_FIELDS.find((f) => f.key.toLowerCase() === parsedVar.fieldType)
    const fieldLabel = field ? field.label : parsedVar.fieldType

    if (parsedVar.description && parsedVar.description !== "général") {
      return `${fieldLabel} ${parsedVar.description}`
    }
    return fieldLabel
  }

  // Pour les variables non reconnues, afficher le nom complet
  return parsedVar.fullName
}

/**
 * Valide si une variable est correctement formée
 * @param variableName - Le nom de la variable
 * @returns boolean - True si la variable est valide
 */
export function isValidVariable(variableName: string): boolean {
  if (!variableName || variableName.trim().length === 0) {
    return false
  }

  // Vérifier que la variable ne contient pas de caractères interdits
  const forbiddenChars = /[{}]/
  return !forbiddenChars.test(variableName)
}

/**
 * Suggère des variables basées sur un texte de recherche
 * @param searchText - Le texte de recherche
 * @returns string[] - Liste de suggestions de variables
 */
export function suggestVariables(searchText: string): string[] {
  const suggestions: string[] = []
  const search = searchText.toLowerCase()

  // Suggestions basées sur les champs de personne
  PERSON_FIELDS.forEach((field) => {
    if (field.key.toLowerCase().includes(search) || field.label.toLowerCase().includes(search)) {
      suggestions.push(field.key)

      // Ajouter quelques variations courantes
      if (field.key === "nom") {
        suggestions.push("nom de famille", "nom du père", "nom de la mère")
      } else if (field.key === "profession") {
        suggestions.push("profession du père", "profession de la mère", "profession du conjoint")
      }
    }
  })

  return suggestions.slice(0, 10) // Limiter à 10 suggestions
}

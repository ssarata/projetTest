export default function PersonneValidate(data: Record<string, any>): Record<string, any> {
  const handler: ProxyHandler<Record<string, any>> = {
    set(target, prop, value) {
      if (prop === "nom") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("Le nom doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      if (prop === "prenom") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("Le prénom doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      // Les autres champs sont optionnels, validation seulement si renseignés
      if (prop === "profession" && value !== undefined && value !== "") {
        if (typeof value !== "string" || value.trim().length > 100) {
          throw new Error("La profession doit être une chaîne de maximum 100 caractères.");
        }
      }

      if (prop === "telephone" && value !== undefined && value !== "") {
        if (!/^[0-9]{10,15}$/.test(value)) {
          throw new Error("Le téléphone doit contenir entre 10 et 15 chiffres.");
        }
      }

      if (prop === "numeroCni" && value !== undefined && value !== "") {
        if (!/^[A-Za-z0-9]{8,20}$/.test(value)) {
          throw new Error("Le numéro CNI doit contenir entre 8 et 20 caractères alphanumériques.");
        }
      }

      if (prop === "sexe" && value !== undefined && value !== "") {
        if (!["M", "F", "Autre"].includes(value)) {
          throw new Error("Le sexe doit être M, F ou Autre.");
        }
      }

      target[prop as keyof typeof target] = value;
      return true;
    },
  };

  return new Proxy(data, handler);
}
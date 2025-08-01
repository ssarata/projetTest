export default function VariableValidate(data: Record<string, any>): Record<string, any> {
  const handler: ProxyHandler<Record<string, any>> = {
    set(target, prop, value) {
      if (prop === "nomVariable") {
        // Vérifie que c'est une chaîne de caractères non vide avec au moins 3 lettres (hors espaces)
        if (typeof value !== "string" || value.trim().replace(/[^a-zA-Z]/g, "").length < 3) {
          throw new Error("Le nom doit être une chaîne contenant au moins 3 lettres.");
        }
      }

      target[prop as keyof typeof target] = value;
      return true;
    },
  };

  return new Proxy(data, handler);
}
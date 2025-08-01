export default function UserValidate(data: Record<string, any>): Record<string, any> {
  const handler: ProxyHandler<Record<string, any>> = {
    set(target, prop, value) {
      if (prop === "username") {
        // Vérifie que le nom d'utilisateur est une chaîne entre 3 et 30 caractères
        if (typeof value !== "string" || value.trim().length < 3 || value.trim().length > 30) {
          throw new Error("Le nom d'utilisateur doit être une chaîne contenant entre 3 et 30 caractères.");
        }
      }

      if (prop === "email") {
        // Vérifie que l'email est valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== "string" || !emailRegex.test(value)) {
          throw new Error("L'email doit être valide.");
        }
      }

      if (prop === "password") {
        // Vérifie que le mot de passe contient au moins 8 caractères
        if (typeof value !== "string" || value.length < 8) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
        }
      }

      target[prop as keyof typeof target] = value;
      return true;
    },
  };

  return new Proxy(data, handler);
}
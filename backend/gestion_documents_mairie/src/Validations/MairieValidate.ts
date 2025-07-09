export default function MairieValidate(data: Record<string, any>): Record<string, any> {
  const handler: ProxyHandler<Record<string, any>> = {
    set(target, prop, value) {
      if (prop === "ville") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("La ville doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      if (prop === "commune") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("La commune doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      if (prop === "region") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("La région doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      if (prop === "prefecture") {
        if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 50) {
          throw new Error("La préfecture doit être une chaîne contenant entre 2 et 50 caractères.");
        }
      }

      target[prop as keyof typeof target] = value;
      return true;
    },
  };

  return new Proxy(data, handler);
}
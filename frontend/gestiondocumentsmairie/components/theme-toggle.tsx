"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Changer le thème"
    >
      {/* Icône du soleil (mode clair) */}
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      {/* Icône de la lune (mode sombre) */}
      <Moon className="hidden h-5 w-5 dark:block" />
      {/* Texte caché pour l'accessibilité */}
      <span className="sr-only">Changer le thème</span>
    </Button>
  );
}

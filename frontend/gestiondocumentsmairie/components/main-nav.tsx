import * as React from "react";
import Link from "next/link";

import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils"; // Si cette fonction n'est pas définie, vérifiez son import ou remplacez-la par clsx ou classnames
import { Icons } from "@/components/icons";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items.map((item) => (
            item.href && (
              <Link
                key={item.href} // Utilisation d'une valeur unique pour la clé (si item.href est unique)
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium text-muted-foreground hover:text-primary", // Ajout d'un effet hover
                  item.disabled && "cursor-not-allowed opacity-80"
                )}
                aria-label={`Lien vers ${item.title}`} // Amélioration de l'accessibilité
              >
                {item.title}
              </Link>
            )
          ))}
        </nav>
      ) : null}
    </div>
  );
}

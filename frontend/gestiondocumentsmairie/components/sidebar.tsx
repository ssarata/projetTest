"use client"; // Indique que ce composant est côté client (Next.js)

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Pour connaître la route active
import clsx from "clsx"; // Pour conditionner les classes CSS

// Icônes utilisées dans le menu
import {
  ChevronDown,
  FileText,
  LogOut,
  Settings,
  Users,
  Building,
  LayoutDashboard
} from "lucide-react";

// Composants UI pour le menu déroulant
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Sidebar() {
  const pathname = usePathname(); // On récupère le chemin actuel pour savoir quel lien est actif
  const [currentTime, setCurrentTime] = useState(new Date()); // État local pour afficher l'heure (optionnel ici)

  // Mettre à jour l'heure chaque seconde
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-slate-200 bg-white">
      {/* --- EN-TÊTE (Logo) --- */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="text-emerald-600 font-bold text-2xl">Docu</div>
          <div className="text-slate-800 font-bold text-2xl">Mairie</div>
        </div>
      </div>

      {/* --- MENU NAVIGATION --- */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">

          {/* --- Lien vers le dashboard --- */}
          <li>
            <Link
              href="/dashboard"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md",
                pathname === "/dashboard"
                  ? "bg-emerald-600 text-white" // Si actif
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </li>

          {/* --- MENU DÉROULANT : Templates --- */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md",
                    pathname.includes("/templates")
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Templates</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>

              {/* Sous-menus */}
              <DropdownMenuContent side="right" align="start" className="ml-2">
                <DropdownMenuItem asChild>
                  <Link href="/templates/index">Tous les templates</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/templates/archives">Templates archivés</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* --- MENU DÉROULANT : Documents --- */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md",
                    pathname.includes("/documents")
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Documents</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>

              {/* Sous-menus */}
              <DropdownMenuContent side="right" align="start" className="ml-2">
                <DropdownMenuItem asChild>
                  <Link href="/documents">Tous les documents</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/documents/archives">Documents archivés</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* --- MENU DÉROULANT : Personnes (ajouté comme demandé) --- */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md",
                    pathname.includes("/personnes")
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Personnes</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>

              {/* Sous-menus */}
              <DropdownMenuContent side="right" align="start" className="ml-2">
                <DropdownMenuItem asChild>
                  <Link href="/personnes">Toutes les personnes</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/personnes/archives">Personnes archivées</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* --- Lien vers la mairie --- */}
          <li>
            <Link
              href="/mairie"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md",
                pathname === "/mairie"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Building className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Mairie</span>
            </Link>
          </li>

          {/* --- Lien vers les paramètres --- */}
          <li>
            <Link
              href="/settings"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md",
                pathname === "/settings"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Settings className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Paramètres</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* --- Bouton de déconnexion --- */}
      <div className="p-4 border-t border-slate-200">
        <Link
          href="/utilisateurs/logout"
          className="flex items-center gap-2 text-red-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </Link>
      </div>
    </aside>
  );
}

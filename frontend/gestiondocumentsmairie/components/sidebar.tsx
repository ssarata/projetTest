"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Settings, FileText, Users, LayoutDashboard, FilePlus, Archive, ChevronDown, Building } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { 
    href: "/templates/index", 
    label: "Templates", 
    icon: FilePlus,
    hasDropdown: true,
    dropdownItems: [
      { href: "/templates/index", label: "Tous les templates", icon: FileText },
      { href: "/templates/archives", label: "Templates archivés", icon: Archive }
    ]
  },
  { 
    href: "/documents", 
    label: "Documents", 
    icon: FileText,
    hasDropdown: true,
    dropdownItems: [
      { href: "/documents", label: "Tous les documents", icon: FileText },
      { href: "/documents/archives", label: "Documents archivés", icon: Archive }
    ]
  },
  { 
    href: "/personnes", 
    label: "personnes", 
    icon: Users, 
    hasDropdown: true,
    dropdownItems: [
      { href: "/personnes", label: "Voir les personnes", icon: Users },
      { href: "/personnes/archives", label: "Voir les personnes archivés", icon: Archive }
    ]
  },
  { 
    href: "/utilisateurs", 
    label: "Utilisateurs", 
    icon: Users, 
    hasDropdown: true,
    dropdownItems: [
      { href: "/utilisateurs", label: "Voir les utilisateurs", icon: Users },
      { href: "/utilisateurs/archives", label: "Voir les utilisateurs archivés", icon: Archive }
    ]
  },
  { href: "/utilisateurs/mairies", label: "Paramètres", icon: Settings },
]

export default function Sidebar() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-slate-200 bg-background dark:bg-slate-900 text-foreground">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="text-emerald-600 font-bold text-2xl">Docu</div>
          <div className="text-slate-800 font-bold text-2xl">Mairie</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(({ label, href, icon: Icon, hasDropdown, dropdownItems }) => (
            <li key={href} className="relative">
              {hasDropdown ? (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                      pathname.startsWith(href) 
                        ? "bg-emerald-600 text-white" 
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      activeDropdown === label ? "rotate-180" : ""
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                            pathname === item.href
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <item.icon className="w-4 h-4 text-emerald-600" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                    pathname === href
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">{label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Déconnexion */}
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
  )
}
"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import {  FileText, Users, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Documents",
    icon: FileText,
    count: 328,
    badge: "+12",
    badgeText: "cette semaine",
    color: "cyan",
  },
  {
    title: "Utilisateurs",
    icon: Users,
    count: 89,
    badge: "+4",
    badgeText: "nouveaux",
    color: "teal",
  },
  {
    title: "Paramètres Mairie",
    icon: Building,
    count: 5,
    badge: "à jour",
    badgeText: "configurations",
    color: "amber",
  },
]

// Color mapping for Tailwind classes
const colorMap = {
  cyan: {
    gradient: "from-cyan-900 to-cyan-800",
    corner: "bg-cyan-400/10",
    iconBg: "bg-cyan-400/20",
    iconText: "text-cyan-300",
    badgeBg: "bg-cyan-400/20",
    badgeText: "text-cyan-200",
    badgeHover: "hover:bg-cyan-400/30",
  },
  teal: {
    gradient: "from-teal-900 to-teal-800",
    corner: "bg-teal-400/10",
    iconBg: "bg-teal-400/20",
    iconText: "text-teal-300",
    badgeBg: "bg-teal-400/20",
    badgeText: "text-teal-200",
    badgeHover: "hover:bg-teal-400/30",
  },
  amber: {
    gradient: "from-amber-900 to-amber-800",
    corner: "bg-amber-400/10",
    iconBg: "bg-amber-400/20",
    iconText: "text-amber-300",
    badgeBg: "bg-amber-400/20",
    badgeText: "text-amber-200",
    badgeHover: "hover:bg-amber-400/30",
  },
}

// Stat Card Component
const StatCard = ({
  title,
  icon: Icon,
  count,
  badge,
  badgeText,
  color,
}: {
  title: string
  icon: React.ElementType
  count: number | string
  badge: string
  badgeText: string
  color: string
}) => {
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.cyan

  return (
    <Card className={cn("bg-gradient-to-br border border-white/10 text-white relative", colors.gradient)}>
      <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-bl-full", colors.corner)} />
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", colors.iconBg)}>
          <Icon className={cn("h-5 w-5", colors.iconText)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{count}</div>
        <div className="flex items-center gap-2">
          <Badge className={cn(colors.badgeBg, colors.badgeText, colors.badgeHover)}>{badge}</Badge>
          <p className="text-xs text-white/70">{badgeText}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen flex bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Content */}
        <div className="flex-1 p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {stats.map((item, index) => (
                <StatCard key={index} {...item} />
              ))}
            </motion.div>

            {/* The "Activité récente" section has been removed */}
          </div>
        </div>
      </div>
    </div>
  )
}

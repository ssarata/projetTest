"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Building, FileText, Users } from "lucide-react";

export default function Home() {
  // Redirige automatiquement vers /acceuil
  if (typeof window !== "undefined") {
    window.location.replace("/utilisateurs/login");
    return null;
  }
  return null;
}

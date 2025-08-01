"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Users, Settings, ArrowRight } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Images de la galerie (à remplacer par vos propres images)
const galleryImages = [
  {
    src: "/images/im.png",
    alt: "Mairie de Tchaoudjo 1",
    caption: "Bâtiment principal de la Mairie de Tchaoudjo 1",
  },
  {
    src: "/images/mairie_1.png",
    alt: "Services administratifs",
    caption: "Services administratifs modernes et efficaces",
  },
  {
    src: "/images/mairie_2.png",
    alt: "Espace citoyen",
    caption: "Espace d'accueil des citoyens",
  },
]

export default function AccueilPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/utilisateurs/login");
  }, [router]);
  // On ne retourne rien car la redirection est immédiate
  return null;

  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(0)

  // Mettre à jour l'index actuel lorsque le carrousel change
  useEffect(() => {
    if (!api) return

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Plugin d'autoplay pour le carrousel
  const autoplayPlugin = Autoplay({ delay: 5000, stopOnInteraction: false })

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-sans">
      {/* Arrière-plan fixe avec superposition de dégradé */}
      <div className="absolute inset-0 z-0">
        
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 via-teal-800/70 to-cyan-800/60" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Barre de navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-center py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="h-12 w-12 relative overflow-hidden rounded-full border-2 border-amber-300/50 shadow-lg shadow-amber-500/20">
              <Image src="/images/logo.png" alt="Logo Mairie" fill className="object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-white drop-shadow-lg">
              Commune <span className="text-amber-300">Tchaoudjo 1</span>
            </h1>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <Link href="/utilisateurs/login">
              <Button
                variant="outline"
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-700/20">
                Connexion
              </Button>
            </Link>
          </div>
        </nav>

        {/* Section héro */}
        <header className="text-center py-12 sm:py-16 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg"
          >
            Gestion Interne <span className="text-cyan-300">Digitalisée</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-white/90 mb-8"
          >
            Plateforme sécurisée pour la gestion des documents administratifs de la Mairie de Tchaoudjo
            1.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link href="/utilisateurs/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-cyan-700/30"
              >
                Accéder à la plateforme <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Carrousel d'images avec shadcn/ui */}
        <div className="max-w-6xl mx-auto mb-16">
          <Carousel
            setApi={setApi}
            plugins={[autoplayPlugin]}
            className="w-full"
            opts={{
              loop: true,
              align: "center",
            }}
          >
            <CarouselContent>
              {galleryImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    {/* Overlay de dégradé pour améliorer la lisibilité du texte */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-teal-900/40 to-transparent z-10" />

                    <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />

                    {/* Légende de l'image */}
                    <div className="absolute bottom-8 left-0 right-0 text-center z-20">
                      <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">
                        <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                          {image.alt}
                        </span>
                      </h3>
                      <p className="text-white/90 mt-2 max-w-lg mx-auto px-4">{image.caption}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              variant="outline"
              className="h-10 w-10 border-cyan-300/30 bg-emerald-900/40 text-white hover:bg-emerald-800/60 hover:text-cyan-300 hover:border-cyan-300/50 left-4 backdrop-blur-sm"
            />
            <CarouselNext
              variant="outline"
              className="h-10 w-10 border-cyan-300/30 bg-emerald-900/40 text-white hover:bg-emerald-800/60 hover:text-cyan-300 hover:border-cyan-300/50 right-4 backdrop-blur-sm"
            />

            {/* Indicateurs de position */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {galleryImages.map((_, index) => (
                <Badge
                  key={index}
                  className={`w-2 h-2 rounded-full p-0 cursor-pointer transition-all border-0 ${
                    index === current ? "bg-amber-400 w-6" : "bg-white/50 hover:bg-amber-300/80"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* Section fonctionnalités */}
        <section className="bg-gradient-to-br from-emerald-900/40 to-teal-800/40 backdrop-blur-sm rounded-2xl mx-auto p-8 sm:p-12 max-w-6xl shadow-xl mb-16 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-white">
            <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
              Fonctionnalités principales
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            {[
              {
                title: "Gestion des Documents",
                desc: "Génération automatique des certificats, légalisations et autres documents administratifs.",
                icon: <FileText className="h-10 w-10" />,
                color: "from-cyan-500 to-cyan-400",
                bgColor: "bg-cyan-600/20",
                borderColor: "border-cyan-400/20",
                hoverColor: "hover:bg-cyan-600/30",
              },
              {
                title: "Gestion des templates dynamiques",
                desc: "Création de templates pour generer les documents administratifs.",
                icon: <Settings className="h-10 w-10" />,
                color: "from-teal-500 to-teal-400",
                bgColor: "bg-teal-600/20",
                borderColor: "border-teal-400/20",
                hoverColor: "hover:bg-teal-600/30",
              },
              {
                title: "Gestion des Utilisateurs",
                desc: "Attribution des rôles et accès restreint aux fonctionnalités selon les profils.",
                icon: <Users className="h-10 w-10" />,
                color: "from-amber-500 to-amber-400",
                bgColor: "bg-amber-600/20",
                borderColor: "border-amber-400/20",
                hoverColor: "hover:bg-amber-600/30",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className={`${item.bgColor} rounded-xl p-6 shadow-lg border ${item.borderColor} ${item.hoverColor} transition-all duration-300 backdrop-blur-sm`}
              >
                <div
                  className={`bg-gradient-to-r ${item.color} p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto shadow-lg`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 text-center">{item.title}</h3>
                <p className="text-white/80 text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        
        <section className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Prêt à <span className="text-amber-300">digitaliser</span> vos services administratifs?
            </h2>
            <p className="text-white/80 mb-8">
              Rejoignez la plateforme de gestion interne de la Mairie de Tchaoudjo 1 dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/utilisateurs/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-700/20"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Pied de page */}
        <footer className="text-center py-6 text-white/60 text-sm border-t border-white/10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p>&copy; 2025 Mairie de Tchaoudjo 1. Tous droits réservés.</p>
            <div className="flex gap-4 mt-3 sm:mt-0">
              <Link href="#" className="hover:text-amber-300 transition-colors">
                Mentions légales
              </Link>
              <Link href="#" className="hover:text-amber-300 transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="#" className="hover:text-amber-300 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
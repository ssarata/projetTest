import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import { tmpdir } from "os"
import { fetchDocumentPersonnesByDocumentId } from "@/services/DocumentPersonneService"
import mairieService from "@/services/mairie"
import { cookies } from "next/headers";

const execAsync = promisify(exec)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let texFilePath = "";
  let pdfFilePath = "";
  let fileName = "";
  const tempDir = tmpdir();
  try {
    const documentId = params.id

    // Récupérer le token d'authentification depuis l'en-tête Authorization
    const authHeader = request.headers.get("authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : undefined;

    // Vérifier la présence de pdflatex
    try {
      await execAsync("pdflatex --version");
    } catch {
      return NextResponse.json({ error: "pdflatex n'est pas installé sur le serveur" }, { status: 500 })
    }

    // Récupérer les données du document et de la mairie
    const doc = await fetchDocumentPersonnesByDocumentId(Number(documentId))
    const mairies = await mairieService.getAll()
    const mairie = mairies?.[0]

    if (!doc || !mairie) {
      return NextResponse.json({ error: "Document ou mairie non trouvé" }, { status: 404 })
    }

    // Générer le contenu LaTeX
    const latexContent = generateLatexContent(doc, mairie, documentId)

    // Créer un fichier temporaire
    fileName = `document_${documentId}_${Date.now()}`
    texFilePath = path.join(tempDir, `${fileName}.tex`)
    pdfFilePath = path.join(tempDir, `${fileName}.pdf`)

    // Écrire le fichier LaTeX
    await fs.writeFile(texFilePath, latexContent, "utf8")

    // Compiler avec pdflatex
    try {
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`, {
        cwd: tempDir,
        timeout: 30000,
      })
    } catch (error) {
      console.error("Erreur compilation LaTeX:", error)
      return NextResponse.json({ error: "Erreur lors de la compilation LaTeX" }, { status: 500 })
    }

    // Lire le PDF généré
    const pdfBuffer = await fs.readFile(pdfFilePath)

    // Nettoyer les fichiers temporaires
    try {
      await fs.unlink(texFilePath)
      await fs.unlink(pdfFilePath)
      const auxFiles = [".aux", ".log", ".out"]
      for (const ext of auxFiles) {
        try {
          await fs.unlink(path.join(tempDir, `${fileName}${ext}`))
        } catch {}
      }
    } catch {}

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document_${documentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Erreur génération PDF:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur interne du serveur" }, { status: 500 })
  } finally {
    // Nettoyage même en cas d'erreur
    if (texFilePath) {
      try { await fs.unlink(texFilePath) } catch {}
    }
    if (pdfFilePath) {
      try { await fs.unlink(pdfFilePath) } catch {}
    }
    if (fileName) {
      const auxFiles = [".aux", ".log", ".out"]
      for (const ext of auxFiles) {
        try { await fs.unlink(path.join(tempDir, `${fileName}${ext}`)) } catch {}
      }
    }
  }
}

function replacePlaceholders(content: string, docPersonnes: any[] = [], mairie: any = {}) {
  if (!content) return ""
  if (!Array.isArray(docPersonnes)) docPersonnes = []
  return content.replace(/{{(.*?)}}/g, (_match, placeholder) => {
    const key = placeholder.trim();
    // Variables mairie dynamiques
    if (key.startsWith("mairie.")) {
      const mairieProp = key.split(".")[1];
      return mairie[mairieProp] ?? "---";
    }
    // Variables personnes
    const docPers = docPersonnes.find((dp) => dp.fonction === key)
    if (docPers && docPers.personne) {
      if (docPers.fonction.includes(".")) {
        const prop = docPers.fonction.split(".")[1]
        return docPers.personne[prop] ?? "---"
      } else {
        return `${docPers.personne.nom} ${docPers.personne.prenom}`
      }
    }
    return "---"
  })
}

function escapeLatex(text: string): string {
  if (!text) return ""
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[{}]/g, "\\$&")
    .replace(/[$&%#^_]/g, "\\$&")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\n\n/g, "\n\n\\vspace{0.5em}\n\n")
    .replace(/\n/g, " ")
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const months = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ]
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  } catch {
    return dateString
  }
}

function generateLatexContent(doc: any[], mairie: any, documentId: string): string {
  const documentData = doc[0]
  const template = documentData?.document?.template
  const content = replacePlaceholders(template?.content || "", doc, mairie)

  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\usepackage{setspace}
\\usepackage{xcolor}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{tikz}

\\geometry{
    top=2cm,
    bottom=3cm,
    left=2.5cm,
    right=2.5cm
}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\onehalfspacing
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

\\begin{document}

\\noindent
\\begin{tabularx}{\\textwidth}{@{}X@{\\hspace{1cm}}r@{}}
\\begin{minipage}[t]{0.6\\textwidth}
    \\raggedright
    \\textbf{\\footnotesize MINISTÈRE DE L'ADMINISTRATION TERRITORIALE} \\\\
    \\footnotesize DE LA DÉCENTRALISATION ET DU DÉVELOPPEMENT \\\\
    \\footnotesize DES TERRITOIRES \\\\[0.4cm]
    
    \\textbf{\\footnotesize RÉGION ${escapeLatex(mairie.region?.toUpperCase() || "")}} \\\\
    \\footnotesize COMMUNE DE ${escapeLatex(mairie.commune?.toUpperCase() || "")} \\\\[0.4cm]
    
    \\footnotesize N° ${documentData?.documentId || documentId} /CT1
\\end{minipage}
&
\\begin{minipage}[t]{0.35\\textwidth}
    \\raggedleft
    \\textbf{\\footnotesize RÉPUBLIQUE TOGOLAISE} \\\\
    \\footnotesize Travail - Liberté - Patrie \\\\[0.4cm]
    
    \\begin{tikzpicture}
    \\draw[thick] (0,0) rectangle (2.5,2.5);
    \\node at (1.25,1.25) {\\footnotesize LOGO};
    \\end{tikzpicture}
\\end{minipage}
\\end{tabularx}

\\vspace{2cm}

\\begin{center}
    {\\Large \\textbf{${escapeLatex(template?.typeDocument?.toUpperCase() || "DOCUMENT OFFICIEL")}}}
\\end{center}

\\vspace{1.5cm}

\\noindent
\\colorbox{gray!10}{%
\\begin{minipage}{\\dimexpr\\textwidth-2\\fboxsep\\relax}
\\vspace{0.8cm}
\\begin{center}
\\begin{minipage}{0.9\\textwidth}
${escapeLatex(content)}
\\end{minipage}
\\end{center}
\\vspace{0.8cm}
\\end{minipage}%
}

\\vspace{2cm}

\\begin{flushright}
    ${escapeLatex(mairie.ville || "")}, le ${formatDate(documentData?.document?.date || new Date().toISOString())} \\\\[0.5cm]
    
    \\textit{Pour le Maire P.O} \\\\[3cm]
    
    \\textbf{Le Maire}
\\end{flushright}

\\vfill
\\begin{center}
    \\begin{tikzpicture}
    \\draw[thick] (0,0) rectangle (2,2);
    \\node at (1,1) {\\tiny LOGO};
    \\end{tikzpicture} \\\\[0.3cm]
    \\textbf{\\footnotesize RÉPUBLIQUE TOGOLAISE} \\\\
    \\footnotesize Travail - Liberté - Patrie
\\end{center}

\\end{document}`
}
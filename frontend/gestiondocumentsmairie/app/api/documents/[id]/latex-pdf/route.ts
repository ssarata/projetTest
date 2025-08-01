import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import { tmpdir } from "os"
import { fetchDocumentPersonnesByDocumentId } from "@/services/DocumentPersonneService"
import mairieService from "@/services/mairie"

async function cleanupFiles(files: (string | null | undefined)[]) {
  for (const file of files) {
    if (file) {
      try {
        await fs.unlink(file);
      } catch {
        // Ignore errors if file doesn't exist
      }
    }
  }
}

const execAsync = promisify(exec)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  let texFilePath = "";
  let pdfFilePath = "";
  let logoFilePath = "";
  let fileName = "";
  const tempDir = tmpdir();
  try {
    const documentId = params.id

    // --- VÉRIFICATION DE L'AUTHENTIFICATION ---
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1]; // Extrait le token de "Bearer <token>"
    if (!token) {
      return NextResponse.json({ error: 'Accès non autorisé. Token manquant.' }, { status: 401 });
    }
    // Vérifier la présence de pdflatex
    try {
      await execAsync("pdflatex --version");
    } catch {
      return NextResponse.json({ error: "pdflatex n'est pas installé sur le serveur" }, { status: 500 })
    }

    // Récupérer les données du document et de la mairie
    // On passe le token reçu aux appels de service internes
    const doc = await fetchDocumentPersonnesByDocumentId(Number(documentId), token)
    const mairies = await mairieService.getAll(token)
    const mairie = mairies?.[0]

    if (!doc || !mairie) {
      return NextResponse.json({ error: "Document ou mairie non trouvé" }, { status: 404 })
    }

    // Télécharger le logo de la mairie s'il existe
    if (mairie.logo) {
      const logoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/mairies/uploads/${mairie.logo}`;
      const logoResponse = await fetch(logoUrl, {
        headers: { Authorization: `Bearer ${token}` } // Transmettre le token pour les appels internes
      });
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        logoFilePath = path.join(tempDir, mairie.logo);
        await fs.writeFile(logoFilePath, Buffer.from(logoBuffer));
      } else {
        console.warn(`Impossible de télécharger le logo depuis ${logoUrl}`);
      }
    }

    // Générer le contenu LaTeX
    const latexContent = generateLatexContent(doc, mairie, documentId, logoFilePath)

    // Créer un fichier temporaire
    fileName = `document_${documentId}_${Date.now()}`
    texFilePath = path.join(tempDir, `${fileName}.tex`)
    pdfFilePath = path.join(tempDir, `${fileName}.pdf`)

    // Écrire le fichier LaTeX
    await fs.writeFile(texFilePath, latexContent, "utf8")

    // Compiler avec pdflatex
    try {
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`, {
        timeout: 30000,
      })
    } catch (error: any) {
      console.error("Erreur compilation LaTeX:", error)
      // Lire le fichier de log pour un débogage plus précis
      let logContent = "Aucun log disponible.";
      try {
        logContent = await fs.readFile(path.join(tempDir, `${fileName}.log`), 'utf8');
      } catch {}
      return NextResponse.json({ 
        error: "Erreur lors de la compilation LaTeX. Vérifiez la syntaxe et les variables.",
        details: logContent 
      }, { status: 500 })
    }

    // Lire le PDF généré
    const pdfBuffer = await fs.readFile(pdfFilePath)

    // Nettoyer les fichiers temporaires
    const logFilePath = path.join(tempDir, `${fileName}.log`);
    const auxFilePath = path.join(tempDir, `${fileName}.aux`);
    await cleanupFiles([texFilePath, pdfFilePath, logoFilePath, logFilePath, auxFilePath]);

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    })
  } catch (error) {
    console.error("Erreur génération PDF:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur interne du serveur" }, { status: 500 })
  } finally {
    // Nettoyage final en cas d'erreur imprévue
    const logFilePath = path.join(tempDir, `${fileName}.log`);
    const auxFilePath = path.join(tempDir, `${fileName}.aux`);
    await cleanupFiles([texFilePath, pdfFilePath, logoFilePath, logFilePath, auxFilePath]);
  }
}

function replacePlaceholders(content: string, docPersonnes: any[] = [], mairie: any = {}): string {
  if (!content) return "";
  if (!Array.isArray(docPersonnes)) docPersonnes = [];

  const regex = /{{(.*?)}}/g;
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Ajouter le texte statique (échappé) qui précède la variable
    result += escapeLatex(content.substring(lastIndex, match.index));

    const placeholder = match[1];
    const keys = placeholder.trim().split('.');
    const fonction = keys[0];
    let value = "---"; // Valeur par défaut

    if (fonction === 'mairie') {
      const prop = keys[1];
      const mairieVal = mairie[prop];
      value = (mairieVal !== null && mairieVal !== undefined) ? String(mairieVal) : "---";
    } else {
      const docPers = docPersonnes.find((dp) => dp.fonction === fonction);
      if (docPers && docPers.personne) {
        if (keys.length === 1) {
          value = `${docPers.personne.prenom || ''} ${docPers.personne.nom || ''}`.trim();
        } else {
          const prop = keys[1];
          const personVal = docPers.personne[prop];
          value = (personVal !== null && personVal !== undefined) ? String(personVal) : "---";
        }
      }
    }

    // Ajouter la valeur dynamique (échappée et en gras)
    result += `\\textbf{${escapeLatex(value || "---")}}`;
    lastIndex = regex.lastIndex;
  }

  // Ajouter le reste du texte statique après la dernière variable
  result += escapeLatex(content.substring(lastIndex));
  return result;
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

function generateLatexContent(doc: any[], mairie: any, documentId: string, logoPath: string): string {
  const documentData = doc[0]
  const template = documentData?.document?.template
  const processedContent = replacePlaceholders(template?.content || "", doc, mairie)

  // Bloc LaTeX pour le logo : image si disponible, sinon placeholder
  const logoBlock = logoPath
    ? `\\includegraphics[width=2.5cm, height=2.5cm, keepaspectratio]{${logoPath.replace(/\\/g, '/')}}`
    : `\\begin{tikzpicture}
    \\draw[thick] (0,0) rectangle (2.5,2.5);
    \\node at (1.25,1.25) {\\footnotesize LOGO};
    \\end{tikzpicture}`;

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
    
    \\footnotesize RÉGION \\textbf{${escapeLatex(mairie.region?.toUpperCase() || "")}} \\\\
    
    \\footnotesize COMMUNE DE \\textbf{${escapeLatex(mairie.commune?.toUpperCase() || "")}} \\\\[0.4cm]
    
    \\footnotesize N° \\textbf{${documentData?.documentId || documentId}} /CT1
\\end{minipage}
&
\\begin{minipage}[t]{0.35\\textwidth}
    \\raggedleft
    \\textbf{\\footnotesize RÉPUBLIQUE TOGOLAISE} \\\\
    \\footnotesize Travail - Liberté - Patrie \\\\[0.4cm]
    
    ${logoBlock}
\\end{minipage}
\\end{tabularx}

\\vspace{2cm}

\\begin{center}
    {\\Large \\textbf{${escapeLatex(template?.typeDocument?.toUpperCase() || "DOCUMENT OFFICIEL")}}}
\\end{center}

\\vspace{1.5cm}

\\noindent
\\colorbox{white!10}{%
\\begin{minipage}{\\dimexpr\\textwidth-2\\fboxsep\\relax}
\\vspace{0.8cm}
\\begin{center}
\\begin{minipage}{0.9\\textwidth}
{\\large ${processedContent}}
\\end{minipage}
\\end{center}
\\vspace{0.8cm}
\\end{minipage}%
}

\\vspace{2cm}

\\begin{flushright}
    ${escapeLatex(mairie.ville || "")}, le ${formatDate(documentData?.document?.date || new Date().toISOString())} \\\\[0.5cm]
    
    \\textit{Pour le Maire P.O} \\\\[3cm]
    
\\end{flushright}

\\end{document}`
}
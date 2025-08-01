import CreateDocumentForm from "@/components/documents/createForm";

export default function CreateDocumentPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Créer un Nouveau Document</h1>
      <CreateDocumentForm />
    </div>
  )
}

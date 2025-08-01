'use client';

import { useEffect, useState } from "react";
import personneService from "@/services/api.personne"; 
import { Personne } from "@/types/personne";
import { Eye, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PersonnesList() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    personneService.getAll()
      .then(setPersonnes)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Supprimer cette personne ?")) {
      await personneService.delete(id);
      setPersonnes(personnes.filter(p => p.id !== id));
    }
  };

  const filtered = personnes.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-white via-emerald-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-900">👤 Liste des personnes</h1>
        <button
          onClick={() => router.push("/personnes/create")}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-emerald-700"
        >
          + Ajouter une personne
        </button>
      </div>
      <input
        type="text"
        placeholder="Rechercher par nom ou prénom..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 px-3 py-2 border rounded w-full max-w-md"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-emerald-200 rounded-xl shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Prénom</th>
              <th className="px-4 py-2">Profession</th>
              {/* <th className="px-4 py-2">Date de naissance</th>
              <th className="px-4 py-2">Lieu de naissance</th> */}
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Adresse</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((personne) => (
              <tr key={personne.id} className="border-t hover:bg-emerald-50">
                <td className="px-4 py-2">{personne.nom}</td>
                <td className="px-4 py-2">{personne.prenom}</td>
                <td className="px-4 py-2">{personne.profession}</td>
                {/* <td className="px-4 py-2">{personne.dateNaissance}</td>
                <td className="px-4 py-2">{personne.lieuNaissance}</td> */}
                <td className="px-4 py-2">{personne.telephone}</td>
                <td className="px-4 py-2">{personne.adresse}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                    onClick={() => router.push(`/personnes/show/${personne.id}`)}
                  >
                    <Eye className="h-4 w-4" /> Voir
                  </button>
                  <button
                    className="flex items-center gap-1 text-green-600 hover:underline"
                    onClick={() => router.push(`/personnes/edit/${personne.id}`)}
                  >
                    <Pencil className="h-4 w-4" /> Modifier
                  </button>
                  <button
                    className="flex items-center gap-1 text-red-600 hover:underline"
                    onClick={() => personne.id !== undefined && handleDelete(personne.id)}
                  >
                    <Trash className="h-4 w-4" /> Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

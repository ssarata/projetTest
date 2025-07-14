'use client'; // <-- Nécessaire car on utilise des hooks et interactions côté client

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import personneService from '@/services/api.personne';
import { EyeIcon, PencilSquareIcon, ArchiveBoxIcon, PlusIcon } from '@heroicons/react/24/outline';
import * as Table from '@/components/ui/table';
import { Personne } from '@/types/personne';

// 🔧 Fonction utilitaire pour formater le numéro local sans +228
function formatLocalPhone(phone?: string | null): string {
  if (!phone) return '—';

  // Supprimer +228 s'il existe et tout caractère non numérique
  const clean = phone.replace(/^\+228/, '').replace(/\D/g, '');

  // Ajouter les tirets : 90123456 -> 90-12-34-56
  return clean.replace(/(\d{2})(?=\d)/g, '$1-').slice(0, 11);
}

export default function PersonnesPage() {
  const [search, setSearch] = useState('');
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Personne[] = await personneService.getAll();
        setPersonnes(data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;

  const filtered = personnes.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (id: number,archiveParId: number) => {
    if (confirm("Voulez-vous vraiment archiver cette personne ?")) {
      try {
        await personneService.archive(id,archiveParId);
        setPersonnes(prev => prev.filter(p => p.id !== id));
      } catch (error: any) {
        alert(error.message || "Erreur lors de l'archivage.");
      }
    }
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Liste des personnes</h1>

        <div className="flex items-center gap-4">
          <input
            type="text"
            className="border px-4 py-2 rounded-lg"
            placeholder="Rechercher par nom ou prénom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Link
            href="/personnes/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table.Root className="w-full">
          <Table.Header>
            <Table.Row>
              <Table.TableColumnHeaderCell>Nom</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Prénom</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Profession</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Date de naissance</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Nationalité</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Numéro CNI</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Sexe</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Lieu de naissance</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Téléphone</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Adresse</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Voir</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Modifier</Table.TableColumnHeaderCell>
              <Table.TableColumnHeaderCell>Archiver</Table.TableColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {filtered.map((p) => (
              <Table.Row key={p.id} className="hover:bg-gray-50">
                <Table.Cell>{p.nom}</Table.Cell>
                <Table.Cell>{p.prenom}</Table.Cell>
                <Table.Cell>{p.profession}</Table.Cell>
                <Table.Cell>{p.dateNaissance}</Table.Cell>
                <Table.Cell>{p.nationalite}</Table.Cell>
                <Table.Cell>{p.numeroCni}</Table.Cell>
                <Table.Cell>{p.sexe}</Table.Cell>
                <Table.Cell>{p.lieuNaissance}</Table.Cell>
                <Table.Cell>{formatLocalPhone(p.telephone)}</Table.Cell>
                <Table.Cell>{p.adresse}</Table.Cell>

                <Table.Cell>
                  <Link
                    href={`/personnes/show/${p.id}`}
                    className="text-blue-500 hover:underline inline-flex items-center"
                  >
                    <EyeIcon className="w-5 h-5 mr-1" />
                  </Link>
                </Table.Cell>

                <Table.Cell>
                  <Link
                    href={`/personnes/edit/${p.id}`}
                    className="text-blue-500 hover:underline inline-flex items-center"
                  >
                    <PencilSquareIcon className="w-5 h-5 mr-1" />
                  </Link>
                </Table.Cell>

                <Table.Cell>
                  <button
                    onClick={() => handleArchive(p.id, p.archiveParId || 0)}
                    className="text-orange-600 hover:underline inline-flex items-center px-2 py-1 rounded z-10"
                    title="Archiver"
                  >
                    <ArchiveBoxIcon className="w-5 h-5 mr-1" />
                    Archiver
                  </button>
                </Table.Cell>

              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </main>
  );
}

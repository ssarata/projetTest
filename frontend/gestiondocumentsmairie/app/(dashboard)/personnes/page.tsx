'use client';  // <-- Ajouter cette ligne pour indiquer que c'est un composant client

import Link from 'next/link';
import { Personne } from '@/types/personne';
import * as Table from '@/components/ui/table';

import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { getAllPersonnes } from '@/services/PersonneService';

export default function PersonnesPage() {
  const [search, setSearch] = useState('');
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPersonnes().then((data) => {
      setPersonnes(data.data as Personne[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  // Filtrage des personnes par nom et prénom
  const filtered = personnes.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Liste des personnes</h1>

        {/* Champ de recherche */}
        <div className="flex items-center">
          <input
            type="text"
            className="border px-4 py-2 rounded-lg"
            placeholder="Rechercher par nom ou prénom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Link
          href="/personnes/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter
        </Link>
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
              <Table.TableColumnHeaderCell>Supprimer</Table.TableColumnHeaderCell>
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
                <Table.Cell>{p.telephone}</Table.Cell>
                <Table.Cell>{p.adresse}</Table.Cell>
                <Table.Cell>
                  <Link href={`/personnes/show/${p.id}`} className="text-blue-500 hover:underline inline-flex items-center">
                    <EyeIcon className="w-5 h-5 mr-1" />
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link href={`/personnes/edit/${p.id}`} className="text-blue-500 hover:underline inline-flex items-center">
                    <PencilSquareIcon className="w-5 h-5 mr-1" />
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link href={`/personnes/delete/${p.id}`} className="text-red-500 hover:underline inline-flex items-center">
                    <TrashIcon className="w-5 h-5 mr-1" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </main>
  );
}

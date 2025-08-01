import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Personne } from '@/types/personne';
import personneService from '@/services/api.personne';

type Props = {
  params: { id: string };
};

export default async function PersonneDetailPage({ params }: Props) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) return notFound(); 
  let personne: Personne | null = null;

  try {
    personne =await personneService.getById(id);
  } catch (error) {
    console.error('Erreur lors de la récupération de la personne :', error);
  }

  if (!personne) return notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link
        href="/personnes"
        className="inline-block mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ← Retour à la liste
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        Détails de {personne.nom} {personne.prenom}
      </h1>

      <div className="grid gap-3 text-lg">
        <p><strong>Nom :</strong> {personne.nom}</p>
        <p><strong>Prénom :</strong> {personne.prenom}</p>
        <p><strong>Profession :</strong> {personne.profession || '—'}</p>
        <p><strong>Date de naissance :</strong> {personne.dateNaissance || '—'}</p>
        <p><strong>Lieu de naissance :</strong> {personne.lieuNaissance || '—'}</p>
        <p><strong>Nationalité :</strong> {personne.nationalite || '—'}</p>
        <p><strong>Sexe :</strong> {personne.sexe || '—'}</p>
        <p><strong>Numéro CNI :</strong> {personne.numeroCni || '—'}</p>
        <p><strong>Téléphone :</strong> {personne.telephone || '—'}</p>
        <p><strong>Adresse :</strong> {personne.adresse || '—'}</p>
      </div>
    </main>
  );
}

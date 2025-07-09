'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import personneService from '@/services/api.personne';
import { Personne } from '@/types/personne';
import Link from 'next/link';

type Props = {
  id: string;
};

export default function EditPersonne({ id }: Props) {
  const router = useRouter();
  const [personne, setPersonne] = useState<Personne | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPersonne = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await personneService.getById(parseInt(id, 10));
        setPersonne(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonne();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (personne) {
      setPersonne({
        ...personne,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (personne) {
      try {
        await personneService.update(parseInt(id, 10), personne);
        router.push('/personnes');
      } catch (err: any) {
        setError(err.message || "Erreur lors de la sauvegarde");
      }
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600 font-bold">Erreur : {error}</div>;
  if (!personne) return <div>Personne introuvable</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Modifier {personne.nom} {personne.prenom}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="nom" value={personne.nom} onChange={handleChange} placeholder="Nom" className="w-full px-4 py-2 border rounded" />
        <input type="text" name="prenom" value={personne.prenom} onChange={handleChange} placeholder="Prénom" className="w-full px-4 py-2 border rounded" />
        <input type="text" name="profession" value={personne.profession || ''} onChange={handleChange} placeholder="Profession" className="w-full px-4 py-2 border rounded" />
        <input type="date" name="dateNaissance" value={personne.dateNaissance || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <input type="text" name="nationalite" value={personne.nationalite || ''} onChange={handleChange} placeholder="Nationalité" className="w-full px-4 py-2 border rounded" />
        <input type="text" name="numeroCni" value={personne.numeroCni || ''} onChange={handleChange} placeholder="Numéro CNI" className="w-full px-4 py-2 border rounded" />

        <select name="sexe" value={personne.sexe || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded">
          <option value="">-- Sexe --</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
        </select>

        <input type="text" name="lieuNaissance" value={personne.lieuNaissance || ''} onChange={handleChange} placeholder="Lieu de naissance" className="w-full px-4 py-2 border rounded" />
        <input type="tel" name="telephone" value={personne.telephone || ''} onChange={handleChange} placeholder="Téléphone" className="w-full px-4 py-2 border rounded" />
        <input type="text" name="adresse" value={personne.adresse || ''} onChange={handleChange} placeholder="Adresse" className="w-full px-4 py-2 border rounded" />

        <div className="flex gap-4">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Sauvegarder
          </button>
          <Link href="/personnes" className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            Annuler
          </Link>
        </div>
      </form>
    </main>
  );
}

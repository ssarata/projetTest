'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import personneService from '@/services/api.personne';
import { Personne } from '@/types/personne';

const EditPersonnePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [personne, setPersonne] = useState<Personne>({
    nom: '',
    prenom: '',
    profession: '',
    dateNaissance: '',
    nationalite: '',
    numeroCni: '',
    sexe: '',
    lieuNaissance: '',
    telephone: '',
    adresse: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const personneData = await personneService.getById(Number(id));
          setPersonne(personneData);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonne({ ...personne, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Données envoyées :", personne);
      const updated = await personneService.update(Number(id), personne);
      setSuccess("Mise à jour réussie !");
      router.push('/personnes'); // Redirection après mise à jour
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Modifier une personne</h1>

      {error && <div className="bg-red-100 text-red-800 p-3 mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-800 p-3 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nom" value={personne.nom} onChange={handleChange} placeholder="Nom" className="w-full border p-2" />
        <input name="prenom" value={personne.prenom} onChange={handleChange} placeholder="Prénom" className="w-full border p-2" />
        <input name="profession" value={personne.profession} onChange={handleChange} placeholder="Profession" className="w-full border p-2" />
        <input name="dateNaissance" type="date" value={personne.dateNaissance} onChange={handleChange} className="w-full border p-2" />
        <input name="nationalite" value={personne.nationalite} onChange={handleChange} placeholder="Nationalité" className="w-full border p-2" />
        <input name="numeroCni" value={personne.numeroCni} onChange={handleChange} placeholder="Numéro CNI" className="w-full border p-2" />
        
        <select name="sexe" value={personne.sexe} onChange={handleChange} className="w-full border p-2">
          <option value="">-- Sélectionnez le sexe --</option>
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>

        <input name="lieuNaissance" value={personne.lieuNaissance} onChange={handleChange} placeholder="Lieu de naissance" className="w-full border p-2" />
        <input name="telephone" value={personne.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full border p-2" />
        <input name="adresse" value={personne.adresse} onChange={handleChange} placeholder="Adresse" className="w-full border p-2" />

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
};

export default EditPersonnePage;

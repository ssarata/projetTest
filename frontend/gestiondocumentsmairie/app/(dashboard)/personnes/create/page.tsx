'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import personneService from "@/services/api.personne"; 
import { Personne } from "@/types/personne";

// Définir les types de données
type FormData = {
  nom: string;
  prenom: string;
  profession: string;
  dateNaissance: string;
  nationalite: string;
  numeroCni: string;
  sexe: string;
  lieuNaissance: string;
  telephone: string;
  adresse: string;
};

export default function CreatePersonne() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Utilisation de React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
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
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await personneService.create(data);
      router.push('/personnes');
    } catch (error) {
      console.error('Erreur lors de la création de la personne:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Structure des champs de formulaire
  const fields = [
    { name: 'nom', label: 'Nom', type: 'text' },
    { name: 'prenom', label: 'Prénom', type: 'text' },
    { name: 'profession', label: 'Profession', type: 'text' },
    { name: 'dateNaissance', label: 'Date de naissance', type: 'date' },
    { name: 'nationalite', label: 'Nationalité', type: 'text' },
    { name: 'numeroCni', label: 'Numéro CNI', type: 'text' },
    { name: 'lieuNaissance', label: 'Lieu de naissance', type: 'text' },
    { name: 'telephone', label: 'Téléphone', type: 'text' },
    { name: 'adresse', label: 'Adresse', type: 'text' },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ajouter une nouvelle personne</h1>

      {/* Affichage des erreurs globales */}
      {errors && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded-md">
          Veuillez remplir tous les champs requis
        </p>
      )}

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block mb-1" htmlFor={name}>{label}</label>
              <Controller
                name={name as keyof FormData}  // Casting ici
                control={control}
                rules={{ required: `${label} est requis` }}
                render={({ field }) => (
                  <input
                    {...field}
                    type={type}
                    id={name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={label}
                  />
                )}
              />
              {errors[name as keyof FormData] && (
                <p className="text-red-500 mt-1">{errors[name as keyof FormData]?.message}</p>
              )}
            </div>
          ))}

          {/* Sexe (select box) */}
          <div>
            <label className="block mb-1" htmlFor="sexe">Sexe</label>
            <Controller
              name="sexe"
              control={control}
              rules={{ required: 'Veuillez sélectionner le sexe' }}
              render={({ field }) => (
                <select
                  {...field}
                  id="sexe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              )}
            />
            {errors.sexe && (
              <p className="text-red-500 mt-1">{errors.sexe?.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Création en cours...' : 'Ajouter'}
        </button>
      </form>
    </main>
  );
}

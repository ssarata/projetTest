'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import personneService from '@/services/api.personne';

type Props = {
  params: { id: string };
};

export default function DeletePersonne({ params }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await personneService.delete(parseInt(params.id, 10));
    router.push('/personnes');
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmer la suppression</h1>
      <p>Êtes-vous sûr de vouloir supprimer cette personne ? Cette action est irréversible.</p>
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          {isDeleting ? 'Suppression en cours...' : 'Supprimer'}
        </button>
        <button
          onClick={() => router.push('/personnes')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Annuler
        </button>
      </div>
    </main>
  );
}

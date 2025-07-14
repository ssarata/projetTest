'use client';

import { useEffect, useState } from 'react';
import { Personne } from '@/types/personne';
import personneService from '@/services/api.personne';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Undo2 } from 'lucide-react';

/**
 * 🔐 Récupère le userId à partir du token JWT
 */
function getUserIdFromToken(): number {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token non trouvé");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch (err) {
    throw new Error("Token invalide");
  }
}

export default function PersonnesArchivesPage() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const data = await personneService.getArchives();
      setPersonnes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des archives :', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurer = async (id: number) => {
    if (!confirm('Voulez-vous vraiment restaurer cette personne ?')) return;
    try {
      setLoadingId(id);
      const userId = getUserIdFromToken();
      await personneService.restore(id, userId);
      await fetchArchives();
    } catch (error) {
      console.error('Erreur lors de la restauration :', error);
      alert("Une erreur est survenue lors de la restauration.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuppression = async (id: number) => {
    if (!confirm('Voulez-vous supprimer définitivement cette personne ?')) return;
    try {
      setLoadingId(id);
      await personneService.delete(id);
      await fetchArchives();
    } catch (error) {
      console.error('Erreur lors de la suppression définitive :', error);
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const filtered = personnes.filter((p) =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-800">👤 Personnes Archivées</h1>

      <Input
        placeholder="🔍 Rechercher par nom ou prénom..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-1/2"
      />

      {loading ? (
        <p className="text-gray-500">Chargement des personnes archivées...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Aucune personne archivée trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-lg p-5 shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition duration-200"
            >
              <div className="mb-4 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-800">
                    👤 {p.prenom} {p.nom}
                  </p>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Archivé
                  </span>
                </div>
                <p className="text-sm text-gray-600">Né(e) le : {p.dateNaissance || '—'}</p>
                <p className="text-sm text-gray-600">Adresse : {p.adresse || '—'}</p>
                <p className="text-sm text-gray-600">Téléphone : {p.telephone || '—'}</p>
                <p className="text-sm text-gray-600">CNI : {p.numeroCni || '—'}</p>
                <p className="text-sm text-gray-600">Sexe : {p.sexe || '—'}</p>
                <p className="text-sm text-gray-600">Nationalité : {p.nationalite || '—'}</p>
                <p className="text-sm text-gray-500">
                  Archivée le : {p.dateArchivage ? new Date(p.dateArchivage).toLocaleDateString() : '—'}
                </p>
                <p className="text-sm text-gray-500">
                  👤 Archivée par : {`Utilisateur #${p.archiveParId}` || '—'}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  disabled={loadingId === p.id}
                  onClick={() => handleRestaurer(p.id!)}
                >
                  <Undo2 className="w-4 h-4 mr-2" />
                  {loadingId === p.id ? 'Restauration...' : 'Restaurer'}
                </Button>

                <Button
                  variant="destructive"
                  disabled={loadingId === p.id}
                  onClick={() => handleSuppression(p.id!)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {loadingId === p.id ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useStudentTracker } from '@/hooks/useStudentTracker';

export default function ProfessorProfilePage({ params }: { params: { id: string } }) {
  const { metrics, trackInteraction, calculateFinalScore } = useStudentTracker();

  const handleSubmitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Calculer le taux de sérieux comportemental
    const seriousnessScore = calculateFinalScore();

    // 2. Récupérer les données du formulaire
    const formData = new FormData(e.currentTarget);
    const leadPayload = {
      professorId: params.id,
      studentName: formData.get('name'),
      studentPhone: formData.get('phone'),
      message: formData.get('message'),
      // On envoie les métriques et le score final à Supabase !
      seriousnessScore: seriousnessScore, 
      behaviorData: metrics, 
    };

    console.log("Envoi du lead qualifié :", leadPayload);
    // await supabase.from('leads').insert([leadPayload]);
  };

  return (
    <div>
      {/* Fiche du professeur */}
      <h1 className="text-2xl font-black">Cours de Mathématiques</h1>
      
      {/* Simulation d'un clic sur l'onglet avis */}
      <div onClick={() => trackInteraction('reviews')} className="cursor-pointer p-4 border my-4">
        Voir les avis des anciens élèves (Cliquez ici pour tester le tracking)
      </div>

      {/* Formulaire de contact rapide */}
      <form onSubmit={handleSubmitLead} className="space-y-4 mt-8">
        <input name="name" placeholder="Votre nom" required className="border p-2 rounded" />
        <input name="phone5" placeholder="Votre téléphone (ex: 06...)" required className="border p-2 rounded" />
        <textarea name="message" placeholder="Votre besoin en cours..." className="border p-2 rounded" />
        <button type="submit" className="bg-orange-500 text-white p-3 rounded font-bold">
          Envoyer ma demande au professeur
        </button>
      </form>
    </div>
  );
}
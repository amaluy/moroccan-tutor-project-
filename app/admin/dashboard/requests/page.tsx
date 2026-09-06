'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function RequestsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans p-8 space-y-8">
      <div className="max-w-[95rem] mx-auto space-y-6">
        
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold text-gray-700 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Retour au Dashboard</span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Validation des Professeurs</h1>
            <p className="text-xs text-gray-500">Gérez ici toutes les demandes en attente de validation.</p>
          </div>
        </div>

        {/* Contenu de la page des requêtes */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <p className="text-sm text-gray-600">La liste des demandes en attente s'affichera ici.</p>
        </div>

      </div>
    </div>
  );
}
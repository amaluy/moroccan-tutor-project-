'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MapPin, Star } from 'lucide-react';

interface Professor {
  id: string;
  name: string;
  subject: string;
  level: string;
  city: string;
  price: number;
  bio: string;
  rating: number;
  total_reviews: number;
  avatar_url: string | null;
}

export default function Home() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfessors();
  }, []);

  async function fetchProfessors() {
    setLoading(true);
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('is_approved', true);

    if (error) {
      console.error('Error:', error);
      alert('Error connecting to Supabase. Check your API keys.');
    } else {
      console.log('Professors loaded:', data);
      setProfessors(data || []);
    }
    setLoading(false);
  }

  const filteredProfessors = professors.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect{' '}
            <span className="text-blue-600">Professor</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with Morocco's best tutors. Rated by students, trusted by parents.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, subject, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading professors...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4">{filteredProfessors.length} professors found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessors.map((professor) => (
                <div
                  key={professor.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{professor.name}</h3>
                        <p className="text-sm text-gray-500">{professor.subject}</p>
                      </div>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 text-sm font-semibold">
                          {professor.rating ? professor.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {professor.city}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {professor.level === 'high_school' ? '🎓 High School' : '🏛️ University'}
                        </span>
                        <span className="font-bold text-blue-600">{professor.price} MAD/h</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProfessors.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No professors found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
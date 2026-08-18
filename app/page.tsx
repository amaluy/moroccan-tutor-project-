'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, MapPin, Star, GraduationCap, Award, Users, 
  ChevronRight, Menu, X, LogIn, UserPlus, 
  BookOpen, Mail, Phone, CheckCircle,
  ArrowDown, HelpCircle, MessageCircle
} from 'lucide-react';

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
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isVisible, setIsVisible] = useState({
    features: false,
    stats: false,
    about: false
  });

  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const [counts, setCounts] = useState({
    tutors: 0,
    students: 0,
    rating: 0,
    subjects: 0
  });

  useEffect(() => {
    fetchProfessors();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'features-section') {
            setIsVisible(prev => ({ ...prev, features: true }));
          }
          if (entry.target.id === 'stats-section') {
            setIsVisible(prev => ({ ...prev, stats: true }));
            animateCounters();
          }
          if (entry.target.id === 'about-section') {
            setIsVisible(prev => ({ ...prev, about: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const targetTutors = professors.length || 50;
    const targetStudents = 500;
    const targetRating = 4.8;
    const targetSubjects = 30;
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounts({
        tutors: Math.min(Math.round(progress * targetTutors), targetTutors),
        students: Math.min(Math.round(progress * targetStudents), targetStudents),
        rating: Math.min(Number((progress * targetRating).toFixed(1)), targetRating),
        subjects: Math.min(Math.round(progress * targetSubjects), targetSubjects)
      });

      if (step >= steps) {
        clearInterval(interval);
        setCounts({
          tutors: targetTutors,
          students: targetStudents,
          rating: targetRating,
          subjects: targetSubjects
        });
      }
    }, stepTime);
  };

  async function fetchProfessors() {
    setLoading(true);
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('is_approved', true);

    if (error) {
      console.error('Error:', error);
    } else {
      setProfessors(data || []);
    }
    setLoading(false);
  }

  const cities = ['all', ...new Set(professors.map(p => p.city))];

  const filteredProfessors = professors.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || p.level === selectedLevel;
    const matchesCity = selectedCity === 'all' || p.city === selectedCity;
    return matchesSearch && matchesLevel && matchesCity;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const Logo = () => (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-12 h-12 transition-transform group-hover:scale-105 duration-300">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="90" fill="url(#logoGradient)"/>
          <path d="M100 35 L35 68 L100 101 L165 68 L100 35Z" fill="white" opacity="0.95"/>
          <path d="M35 68 L35 101 L100 134 L165 101 L165 68" fill="white" opacity="0.5"/>
          <rect x="72" y="90" width="56" height="24" rx="4" fill="white" opacity="0.8"/>
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB"/>
              <stop offset="100%" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <span className="font-bold text-2xl text-slate-900">Moroccan<span className="text-blue-600">Tutors</span></span>
        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-0.5">Education Platform</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Logo />

            <div className="hidden md:flex items-center gap-8">
              {['Home', 'Features', 'Find Tutors', 'About', 'Help'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-slate-600 hover:text-blue-600 transition font-medium text-sm relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition-all hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
              <button 
                onClick={() => setShowSignUp(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-all hover:scale-105"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {['Home', 'Features', 'Find Tutors', 'About', 'Help'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block text-slate-600 hover:text-blue-600 transition font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </button>
                <button 
                  onClick={() => { setShowSignUp(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
            Morocco's #1 Education Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Professor Today
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-10">
            Connect with Morocco's most qualified educators.
            <span className="block text-slate-500 text-lg mt-1">Rated by students, trusted by parents.</span>
          </p>

          <div className="flex justify-center gap-8 md:gap-12 mb-10">
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                {professors.length}+
              </div>
              <div className="text-sm text-slate-500">Expert Tutors</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
                4.8
              </div>
              <div className="text-sm text-slate-500">Average Rating</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-3xl font-bold text-pink-600 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-sm text-slate-500">Students Helped</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => document.getElementById('find-tutors')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-600/30 transition-all hover:scale-105 text-lg group"
            >
              Find a Tutor Now
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setShowSignUp(true)}
              className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:shadow-lg transition-all hover:scale-105 text-lg"
            >
              Join as Professor
            </button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" 
               onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}>
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-14 transition-all duration-1000 transform ${
            isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Why Choose <span className="text-blue-600">Moroccan Tutors</span>
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              Everything you need to find the perfect professor for your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, color: 'blue', title: 'Qualified Tutors', desc: 'All professors are verified, experienced, and passionate about teaching' },
              { icon: Star, color: 'purple', title: 'Verified Reviews', desc: 'Real ratings and reviews from real students just like you' },
              { icon: BookOpen, color: 'green', title: 'All Subjects', desc: 'From high school to university, find experts in every subject' }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-default ${
                  isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-1000 transform ${
            isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="group cursor-default">
              <div className="text-4xl md:text-5xl font-bold group-hover:scale-110 transition-transform duration-300">
                {counts.tutors}+
              </div>
              <div className="text-sm opacity-80 mt-1">Expert Tutors</div>
            </div>
            <div className="group cursor-default">
              <div className="text-4xl md:text-5xl font-bold group-hover:scale-110 transition-transform duration-300">
                {counts.students}+
              </div>
              <div className="text-sm opacity-80 mt-1">Happy Students</div>
            </div>
            <div className="group cursor-default">
              <div className="text-4xl md:text-5xl font-bold group-hover:scale-110 transition-transform duration-300">
                {counts.rating}
              </div>
              <div className="text-sm opacity-80 mt-1">Average Rating</div>
            </div>
            <div className="group cursor-default">
              <div className="text-4xl md:text-5xl font-bold group-hover:scale-110 transition-transform duration-300">
                {counts.subjects}+
              </div>
              <div className="text-sm opacity-80 mt-1">Subjects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="find-tutors" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Find Your <span className="text-blue-600">Professor</span></h2>
            <p className="text-slate-600">Search by name, subject, or city</p>
          </div>

          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name, subject, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-lg shadow-slate-200/50 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium text-slate-700 hover:border-blue-300 cursor-pointer"
              >
                <option value="all">📚 All Levels</option>
                <option value="high_school">🎓 High School</option>
                <option value="university">🏛️ University</option>
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium text-slate-700 hover:border-blue-300 cursor-pointer"
              >
                <option value="all">📍 All Cities</option>
                {cities.filter(c => c !== 'all').map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading professors...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-500 font-medium">
                  <span className="font-bold text-slate-800">{filteredProfessors.length}</span> professors found
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessors.map((professor, index) => (
                  <div
                    key={professor.id}
                    className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-blue-200 overflow-hidden hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {getInitials(professor.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">{professor.name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{professor.subject}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                          {professor.city}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                              {professor.level === 'high_school' ? '🎓 High School' : '🏛️ University'}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-slate-700">
                                {professor.rating ? professor.rating.toFixed(1) : 'New'}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-blue-600 text-lg">{professor.price} <span className="text-xs text-slate-400 font-normal">MAD/h</span></span>
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 flex items-center justify-center gap-2 group-hover:scale-[1.02] duration-300">
                        View Profile
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProfessors.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-500 text-lg">No professors found. Try adjusting your search.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" ref={aboutRef} className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 transform ${
            isVisible.about ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                About <span className="text-blue-600">Moroccan Tutors</span>
              </h2>
              <p className="text-slate-600 mb-4">
                We believe that every student deserves access to quality education. Our platform connects students with the best professors across Morocco.
              </p>
              <p className="text-slate-600 mb-6">
                Whether you're preparing for exams, need extra support, or want to master a new subject, we've got you covered.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Verified Professors', 'Flexible Scheduling', 'Affordable Rates'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Students', value: '500+', color: 'blue' },
                { label: 'Expert Tutors', value: '50+', color: 'purple' },
                { label: 'Avg Rating', value: '4.8', color: 'green' },
                { label: 'Subjects', value: '30+', color: 'pink' }
              ].map((stat) => (
                <div key={stat.label} className="bg-gradient-to-br from-blue-600/10 to-blue-600/5 p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300 cursor-default">
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section id="help" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 mt-2">Everything you need to know about Moroccan Tutors</p>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How do I find a professor?', a: 'Simply search by subject, level, or city. Browse through the results and view their profiles to learn more about their experience and rates.' },
              { q: 'How do I book a session?', a: 'Once you find a professor you like, click "Request Session" on their profile. Fill in your details and the professor will get back to you within 24 hours.' },
              { q: 'How much does it cost?', a: 'Each professor sets their own rates. You\'ll see the price per hour on their profile. Most professors charge between 150-350 MAD per hour.' },
              { q: 'How do I become a professor?', a: 'Click "Join as Professor" on the homepage. Fill in your details, and our team will review your application within 48 hours.' }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:border-blue-200 group cursor-default"
              >
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{faq.q}</h4>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  MT
                </div>
                <span className="font-bold text-lg">Moroccan<span className="text-blue-400">Tutors</span></span>
              </div>
              <p className="text-sm text-slate-400">Connecting students with Morocco's best tutors since 2026</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Home</a></li>
                <li><a href="#features-section" className="hover:text-white transition">Features</a></li>
                <li><a href="#find-tutors" className="hover:text-white transition">Find Tutors</a></li>
                <li><a href="#about-section" className="hover:text-white transition">About Us</a></li>
                <li><a href="#help" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Tutors</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Join as Tutor</a></li>
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition">Tutor Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Get In Touch</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@moroccantutors.com</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +212 6 00 00 00 00</li>
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> @moroccantutors</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
            © 2026 Moroccan Tutors. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-slate-100 rounded-lg transition hover:rotate-90 duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition" placeholder="••••••••" />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition">
                Log In
              </button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-4">
              Don't have an account?{' '}
              <button onClick={() => { setShowLogin(false); setShowSignUp(true); }} className="text-blue-600 font-medium hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                            <button onClick={() => setShowSignUp(false)} className="p-2 hover:bg-slate-100 rounded-lg transition hover:rotate-90 duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition" placeholder="Ahmed Benjelloun" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">I am a...</label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition">
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition">
                Create Account
              </button>
            </form>
            <p className="text-center text-sm text-slate-600 mt-4">
              Already have an account?{' '}
              <button onClick={() => { setShowSignUp(false); setShowLogin(true); }} className="text-blue-600 font-medium hover:underline">
                Log In
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
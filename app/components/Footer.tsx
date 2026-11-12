'use client';

import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { ROUTES } from '@/lib/siteconfig';

interface SiteFooterProps {
  /** Sur l'accueil : filtre la liste. Ailleurs : renvoie vers l'accueil avec le filtre. */
  onSelectSubject?: (subject: string) => void;
  onOpenHelp?: () => void;
}

const FOOTER_SUBJECTS = [
  { label: 'Mathématiques', value: 'Maths' },
  { label: 'Physique & Chimie', value: 'Physique et Chimie' },
  { label: 'Langue Française', value: 'Français' },
  { label: 'Anglais & Communication', value: 'Anglais' },
  { label: 'SVT & Biologie', value: 'SVT' },
];

export default function SiteFooter({ onSelectSubject, onOpenHelp }: SiteFooterProps) {
  const linkClass = 'hover:text-orange-400 transition';

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-[90rem] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        <div className="lg:col-span-2 space-y-5">
          <Link href={ROUTES.home} aria-label="profmaroc, accueil">
            <Logo tone="dark" size="lg" />
          </Link>
          <p className="text-xs sm:text-sm leading-relaxed max-w-sm">
            La plateforme marocaine de référence pour trouver des professeurs particuliers qualifiés en ligne et à domicile, sans aucun frais d'intermédiaire.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Matières</h4>
          <ul className="space-y-2.5 text-xs">
            {FOOTER_SUBJECTS.map((s) => (
              <li key={s.value}>
                {onSelectSubject ? (
                  <button onClick={() => onSelectSubject(s.value)} className={`${linkClass} cursor-pointer`}>
                    {s.label}
                  </button>
                ) : (
                  <Link href={`/?matiere=${encodeURIComponent(s.value)}#professeurs`} className={linkClass}>
                    {s.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Liens utiles</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href={ROUTES.becomeTeacher} className={linkClass}>Devenir professeur</Link></li>
            <li><Link href={ROUTES.login} className={linkClass}>Se connecter</Link></li>
            <li><Link href="/#comment-ca-marche" className={linkClass}>Comment ça marche</Link></li>
            <li><Link href="/#faq" className={linkClass}>Questions fréquentes</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">ProfMaroc</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href={ROUTES.about} className={linkClass}>Qui sommes-nous</Link></li>
            <li><Link href={ROUTES.contact} className={linkClass}>Nous contacter</Link></li>
            <li>
              {onOpenHelp ? (
                <button onClick={onOpenHelp} className={`${linkClass} cursor-pointer`}>Centre d'aide</button>
              ) : (
                <Link href={ROUTES.contact} className={linkClass}>Centre d'aide</Link>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 px-6 lg:px-12 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500 max-w-[90rem] mx-auto">
        <p>© {new Date().getFullYear()} ProfMaroc. Tous droits réservés.</p>
        <div className="flex justify-center gap-6 mt-4 sm:mt-0">
          <Link href={ROUTES.terms} className="hover:text-slate-300 transition">Conditions d'utilisation</Link>
          <Link href={ROUTES.privacy} className="hover:text-slate-300 transition">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

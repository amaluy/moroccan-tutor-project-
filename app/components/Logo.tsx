import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

type LogoProps = {
  /** "light" = sur fond clair, "dark" = sur fond sombre */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  /** Cache le pictogramme et garde seulement le mot-symbole */
  wordmarkOnly?: boolean;
  /** Cache le texte (ex. barre latérale repliée) */
  markOnly?: boolean;
  /** Si fourni, le logo devient un lien */
  href?: string;
  className?: string;
};

const SIZES = {
  sm: { box: 'size-8 rounded-lg', icon: 'size-4', text: 'text-lg' },
  md: { box: 'size-9 rounded-xl', icon: 'size-5', text: 'text-xl' },
  lg: { box: 'size-11 rounded-xl', icon: 'size-6', text: 'text-2xl' },
} as const;

/** Logo unique de profmaroc : à utiliser partout à la place des variantes copiées. */
export default function Logo({
  tone = 'light',
  size = 'md',
  wordmarkOnly = false,
  markOnly = false,
  href,
  className = '',
}: LogoProps) {
  const s = SIZES[size];
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {!wordmarkOnly && (
        <span
          aria-hidden
          className={`${s.box} grid shrink-0 place-items-center bg-brand-600 text-white shadow-[0_8px_18px_-10px_var(--color-brand-500)]`}
        >
          <GraduationCap className={s.icon} strokeWidth={2.25} />
        </span>
      )}
      {!markOnly && (
        <span
          className={`font-display ${s.text} font-extrabold leading-none tracking-tight ${
            tone === 'dark' ? 'text-white' : 'text-slate-900'
          }`}
        >
          prof<span className={tone === 'dark' ? 'text-brand-400' : 'text-brand-600'}>maroc</span>
        </span>
      )}
      <span className="sr-only">{markOnly ? 'profmaroc' : ''}</span>
    </span>
  );

  return href ? (
    <Link href={href} aria-label="profmaroc, retour à l'accueil" className="inline-flex rounded-xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

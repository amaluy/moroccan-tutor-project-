'use client';

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Users, X, Sun, Moon, LogOut, ChevronDown, User, Coins, Plus, Minus,
  LayoutGrid, ChevronsLeft, ChevronsRight, ArrowUpRight, ArrowDownRight, Megaphone,
  CheckCircle2, Clock, Menu, MapPin, BookOpen, Check, Copy, Share2, ExternalLink,
  MessageCircle, Scissors, Flame, ChevronRight, Eye, Inbox,
  Heart, Trash2, Power, Tag, Info, Loader2, Sparkles, Target, Percent
} from 'lucide-react';

import GestionDemandeView from './gestion_demande/page';

/* ------------------------------------------------------------------ */
/*  CONFIG — à ajuster                                                 */
/* ------------------------------------------------------------------ */
const PACK_PRICE_DH = 100;               // prix d'une recharge
const LEADS_PER_PACK = 10;               // leads inclus dans une recharge
const LOW_LEADS_THRESHOLD = 3;           // alerte crédits bas
const HOURS_PER_MONTH = 4;               // heures/mois estimées par élève
const SUPPORT_WHATSAPP = '212600000000'; // ⚠️ REMPLACER (format international, sans +)
const MAX_ACTIVE_PROMOS = 3;
const BOOST_CAP = 50;
const REFRESH_MS = 30_000;               // resynchronisation du solde et des demandes

/* ------------------------------------------------------------------ */
/*  BASE DE DONNÉES — noms de colonnes réels                           */
/* ------------------------------------------------------------------ */
const BASE_COLS = 'id,email,"Prénom","Nom",telephone,niveau,ville,tarif,bio,is_approved,experience,"Type_cours","photo_URL",disponibilites,leads_restants,matiere';
const EXT_COLS = `${BASE_COLS},available,monthly_goal`;

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
interface Professor {
  id: string;
  email?: string;
  leads_restants?: number;
  available?: boolean;
  monthly_goal?: number;
  [key: string]: any;
}
interface Lead {
  id?: string | number;
  status?: string;
  lead_date?: string;
  is_read?: boolean;
  [key: string]: any;
}
interface Promo {
  id: string;
  title: string;
  body: string;
  discount_percent: number | null;
  ends_at: string;
  is_active: boolean;
  likes_count: number;
  created_at: string;
}
type Tab = 'overview' | 'demandes' | 'credits' | 'publicites';
type Range = 'semaine' | 'mois' | 'annee';
type Bucket = { label: string; start: number; end: number };
type Point = { label: string; views: number; leads: number };
type TodoKind = 'available' | 'credits' | 'pending' | 'profile' | 'share' | 'none';

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const DAY = 86_400_000;
const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const WEEKDAYS_FULL = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const SLOTS = ['0-4h', '4-8h', '8-12h', '12-16h', '16-20h', '20-24h'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function buildBuckets(range: Range, now: Date): Bucket[] {
  const today = startOfDay(now);
  if (range === 'semaine' || range === 'mois') {
    const n = range === 'semaine' ? 7 : 30;
    return Array.from({ length: n }, (_, k) => {
      const i = n - 1 - k;
      const start = today - i * DAY;
      const d = new Date(start);
      return { label: range === 'semaine' ? WEEKDAYS[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`, start, end: start + DAY };
    });
  }
  return Array.from({ length: 12 }, (_, k) => {
    const i = 11 - k;
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    return { label: MONTHS[start.getMonth()], start: start.getTime(), end: end.getTime() };
  });
}

const countIn = (times: number[], start: number, end: number) =>
  times.reduce((a, t) => (t >= start && t < end ? a + 1 : a), 0);

const toTimes = (rows: any[], field: string) =>
  rows.map((r) => new Date(r[field]).getTime()).filter((t) => Number.isFinite(t));

function delta(cur: number, prev: number): { text: string; dir: 'up' | 'down' | 'flat' } {
  if (prev === 0 && cur === 0) return { text: '0%', dir: 'flat' };
  if (prev === 0) return { text: 'Nouveau', dir: 'up' };
  const pct = ((cur - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return { text: '0%', dir: 'flat' };
  return { text: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`, dir: pct > 0 ? 'up' : 'down' };
}

const niceMax = (v: number) => {
  if (v <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
};

const asList = (v: any): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.replace(/^\{|\}$/g, '').split(',').map((x) => x.replace(/^"|"$/g, '').trim()).filter(Boolean);
  return [];
};

const toNumber = (v: any) => {
  const n = Number(String(v ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const isAccepted = (s?: string) => (s || '').toLowerCase() === 'accepted';
const isPending = (s?: string) => (s || '').toLowerCase() === 'pending';

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `il y a ${mo} mois` : 'il y a plus d’un an';
};

const since = (iso?: string) => {
  const ms = Date.now() - new Date(iso || '').getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(m, 1)} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} jour${d > 1 ? 's' : ''}`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo} mois` : 'plus d’un an';
};

const topCounts = (items: string[], n = 3) => {
  const map = new Map<string, number>();
  items.filter(Boolean).forEach((i) => map.set(i.trim(), (map.get(i.trim()) || 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
};

const fmt = (n: number) => n.toLocaleString('fr-FR');
const inDays = (n: number) => new Date(Date.now() + n * DAY).toISOString().slice(0, 10);
const isLivePromo = (p: Promo) => p.is_active && new Date(p.ends_at).getTime() > Date.now();

async function fetchProfessor(apply: (q: any) => any): Promise<Professor | null> {
  for (const cols of [EXT_COLS, BASE_COLS, '*']) {
    const { data, error } = await apply(supabase.from('professors').select(cols)).limit(1).maybeSingle();
    if (error) continue;
    if (!data) return null;
    const safe: any = { ...data };
    delete safe.password;
    delete safe.is_admin;
    return safe as Professor;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  STYLES GLOBAUX                                                     */
/* ------------------------------------------------------------------ */
const CSS = `
.pm-light{--paper:#F7F8FA;--rule:#F1F3F6;--sheet:#FFFFFF;--edge:#E8EBF0;--ink:#0B1220;--muted:#667085;--blue:#DC3B18;--onblue:#FFFFFF;--red:#E11D48;--accent:#FF5733;--accent-ink:#B52E12;--hl:rgba(255,87,51,.09);--green:#0E9F6E;--side:#FFFFFF;--shadow:rgba(16,24,40,.22);--dark:#0B1220;--ondark:#FFFFFF}
.pm-dark{--paper:#0F1217;--rule:#1E232C;--sheet:#171B22;--edge:#272D38;--ink:#F5F7FA;--muted:#9AA3B2;--blue:#FF5733;--onblue:#1A0E05;--red:#FF6B8A;--accent:#FF6F4D;--accent-ink:#FF9A80;--hl:rgba(255,87,51,.15);--green:#3DDC97;--side:#12151B;--shadow:rgba(0,0,0,.7);--dark:#F5F7FA;--ondark:#0B1220}

.pm{font-family:var(--font-sans);color:var(--ink);background:var(--paper)}
.pm *{box-sizing:border-box}
.pm :focus-visible{outline:2px solid var(--blue);outline-offset:2px;border-radius:8px}
.pm-display{font-family:var(--font-display);font-variation-settings:'opsz' 60;letter-spacing:-.025em}
.pm-num{font-variant-numeric:tabular-nums}
.pm-muted{color:var(--muted)}
.pm-paper{background:var(--paper)}
.pm-sheet{background:var(--sheet);border:1px solid var(--edge);border-radius:16px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 10px 26px -18px var(--shadow)}
.pm-edge{border-color:var(--edge)}
.pm-pill{display:inline-flex;align-items:center;gap:.375rem;border-radius:999px;padding:.25rem .65rem;font-size:11px;font-weight:700;background:var(--hl);color:var(--accent-ink);border:1px solid color-mix(in srgb,var(--blue) 25%,transparent)}
.pm-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--hl);color:var(--accent-ink)}
:where(.pm-btn){display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:10px;font-weight:700;cursor:pointer;transition:transform .15s,box-shadow .15s,background-color .15s,border-color .15s}
.pm-btn:hover{transform:translateY(-1px)}
.pm-btn:active{transform:translateY(0)}
.pm-btn-blue{background:var(--blue);color:var(--onblue);box-shadow:0 8px 18px -10px var(--blue)}
.pm-btn-dark{background:var(--dark);color:var(--ondark)}
.pm-btn-red{background:var(--red);color:#fff}
.pm-btn-green{background:var(--green);color:#fff}
.pm-btn-ghost{background:var(--sheet);color:var(--ink);border:1px solid var(--edge)}
.pm-btn-ghost:hover{border-color:var(--blue)}
.pm-input{width:100%;border:1px solid var(--edge);border-radius:10px;padding:.625rem .75rem;font-size:.875rem;background:var(--paper);color:var(--ink)}
.pm-dots{background-image:linear-gradient(to right,var(--edge) 50%,transparent 0);background-size:6px 1px;background-repeat:repeat-x;background-position:bottom}
.pm-nav{color:var(--muted)}
.pm-nav:hover{background:var(--rule);color:var(--ink)}
.pm-nav-on{background:var(--hl);color:var(--accent-ink)}
.pm-seg{display:inline-flex;gap:2px;padding:3px;border-radius:12px;background:var(--rule)}
@media(prefers-reduced-motion:reduce){.pm-btn{transition:none}}
`;

/* ------------------------------------------------------------------ */
/*  PETITS COMPOSANTS                                                  */
/* ------------------------------------------------------------------ */
function Delta({ text, dir }: { text: string; dir: 'up' | 'down' | 'flat' }) {
  const Icon = dir === 'up' ? ArrowUpRight : dir === 'down' ? ArrowDownRight : Minus;
  const color = dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--muted)';
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      <Icon className="size-3 stroke-[2.5]" />{text}
    </span>
  );
}

function Tickets({ n, low }: { n: number; low?: boolean }) {
  const total = Math.min(Math.max(LEADS_PER_PACK, Math.ceil(n / LEADS_PER_PACK) * LEADS_PER_PACK), 40);
  const filled = Math.min(n, total);
  const color = low ? 'var(--red)' : 'var(--blue)';
  return (
    <div className="flex flex-wrap gap-1.5" role="img" aria-label={`${n} leads restants`}>
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <span
            key={i}
            style={{
              width: 22, height: 32, borderRadius: 4,
              border: on ? 'none' : '1.5px dashed var(--edge)',
              background: on
                ? `radial-gradient(circle at 0 50%, var(--sheet) 3.5px, transparent 4px), radial-gradient(circle at 100% 50%, var(--sheet) 3.5px, transparent 4px), ${color}`
                : 'transparent',
            }}
          />
        );
      })}
    </div>
  );
}

function Grade({ score20, comment, missing }: { score20: number; comment: string; missing: string[] }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score20 / 20, 0), 1);
  return (
    <div className="pm-sheet p-5 w-full lg:w-[360px] self-start" style={{ background: 'var(--paper)' }}>
      <div className="flex items-center gap-5">
        <div className="relative size-[96px] shrink-0">
          <svg viewBox="0 0 112 112" className="size-full -rotate-90" aria-hidden>
            <circle cx="56" cy="56" r={r} fill="none" strokeWidth="9" style={{ stroke: 'var(--edge)' }} />
            <circle cx="56" cy="56" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-700"
              style={{ stroke: 'var(--blue)' }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="pm-display pm-num text-2xl font-extrabold leading-none">{score20}<span className="text-xs font-bold pm-muted">/20</span></p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider pm-muted">Qualité du profil</p>
          <p className="pm-display text-xl font-bold mt-0.5 leading-6">{comment}</p>
        </div>
      </div>
      {missing.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold pm-muted mb-2">À compléter</p>
          <div className="flex flex-wrap gap-2">
            {missing.slice(0, 4).map((m) => (
              <Link key={m} href="/prof/profile" className="inline-flex items-center gap-1 rounded-full border pm-edge px-3 py-1 text-xs font-semibold transition-colors hover:border-[var(--blue)] hover:bg-[var(--hl)]" style={{ background: 'var(--sheet)' }}>
                <Plus className="size-3" />{m}
              </Link>
            ))}
            {missing.length > 4 && <span className="text-xs font-semibold pm-muted self-center">+{missing.length - 4}</span>}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--green)' }}>Profil complet, bravo !</p>
      )}
    </div>
  );
}

function AreaChart({ data, labelEvery }: { data: Point[]; labelEvery: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 260, pl = 34, pr = 12, pt = 16, pb = 30;
  const n = data.length;
  const maxY = niceMax(Math.max(...data.map((d) => Math.max(d.views, d.leads)), 1));
  const x = (i: number) => pl + (n === 1 ? 0 : (i * (W - pl - pr)) / (n - 1));
  const y = (v: number) => pt + (1 - v / maxY) * (H - pt - pb);
  const base = H - pb;
  const line = (key: 'views' | 'leads') => {
    let d = `M ${x(0)} ${y(data[0]?.[key] ?? 0)}`;
    for (let i = 1; i < n; i++) {
      const cx = (x(i - 1) + x(i)) / 2;
      d += ` C ${cx} ${y(data[i - 1][key])} ${cx} ${y(data[i][key])} ${x(i)} ${y(data[i][key])}`;
    }
    return d;
  };
  const area = `${line('views')} L ${x(n - 1)} ${base} L ${x(0)} ${base} Z`;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)} role="img" aria-label="Courbe des vues et des demandes">
        <defs>
          <linearGradient id="pmViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--blue)', stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: 'var(--blue)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => {
          const yy = pt + g * (H - pt - pb);
          return (
            <g key={g}>
              <line x1={pl} x2={W - pr} y1={yy} y2={yy} style={{ stroke: 'var(--edge)' }} strokeDasharray="2 5" />
              <text x={pl - 8} y={yy + 4} textAnchor="end" fontSize="11" fontWeight="600" style={{ fill: 'var(--muted)' }}>{Math.round(maxY * (1 - g))}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#pmViews)" />
        <path d={line('views')} fill="none" style={{ stroke: 'var(--blue)' }} strokeWidth="2.75" strokeLinecap="round" />
        <path d={line('leads')} fill="none" style={{ stroke: 'var(--ink)' }} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
        {data.map((d, i) => (i % labelEvery === 0 || i === n - 1) ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fontWeight="600" style={{ fill: 'var(--muted)' }}>{d.label}</text>
        ) : null)}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pt} y2={base} style={{ stroke: 'var(--blue)' }} strokeOpacity="0.35" />
            <circle cx={x(hover)} cy={y(data[hover].views)} r="5" style={{ fill: 'var(--blue)', stroke: 'var(--sheet)' }} strokeWidth="2.5" />
            <circle cx={x(hover)} cy={y(data[hover].leads)} r="5" style={{ fill: 'var(--ink)', stroke: 'var(--sheet)' }} strokeWidth="2.5" />
          </g>
        )}
        {data.map((_, i) => {
          const w = n === 1 ? W : (W - pl - pr) / (n - 1);
          return <rect key={i} x={x(i) - w / 2} y={pt} width={w} height={H - pt - pb} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />;
        })}
      </svg>
      {hover !== null && (
        <div className="pm-sheet pointer-events-none absolute -top-2 z-10 -translate-x-1/2 px-3 py-2 text-xs"
          style={{ left: `${Math.min(Math.max((x(hover) / W) * 100, 12), 88)}%` }}>
          <p className="font-bold mb-1">{data[hover].label}</p>
          <p className="flex items-center gap-1.5 font-semibold"><span className="size-2 rounded-full" style={{ background: 'var(--blue)' }} />{data[hover].views} vue(s)</p>
          <p className="flex items-center gap-1.5 font-semibold"><span className="size-2 rounded-full" style={{ background: 'var(--ink)' }} />{data[hover].leads} demande(s)</p>
        </div>
      )}
    </div>
  );
}

function RoiNote(props: { tarif: number; breakEvenHours: number; monthlyPerStudent: number; roiMultiple: number }) {
  const { tarif, breakEvenHours, monthlyPerStudent, roiMultiple } = props;
  if (tarif <= 0) {
    return (
      <p className="text-sm pm-muted leading-relaxed">
        Indiquez votre tarif horaire dans <Link href="/prof/profile" className="font-bold underline" style={{ color: 'var(--blue)' }}>votre profil</Link> pour voir combien rapporte chaque lead.
      </p>
    );
  }
  const rows: [string, string][] = [
    ['Amortie en (à ' + tarif + ' DH/h)', `${String(breakEvenHours).replace('.', ',')} h de cours`],
    [`1 élève × ${HOURS_PER_MONTH} h par mois`, `${fmt(monthlyPerStudent)} MAD`],
  ];
  return (
    <div className="space-y-4">
      <dl className="text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 py-2 pm-dots">
            <dt className="pm-muted">{k}</dt><dd className="font-bold pm-num text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--hl)' }}>
        <p className="pm-display pm-num text-4xl font-extrabold leading-none" style={{ color: 'var(--accent-ink)' }}>×{roiMultiple}</p>
        <p className="text-sm font-semibold leading-5">le prix d&apos;un lead, dès le premier élève.</p>
      </div>
      <p className="text-[11px] pm-muted">Estimation indicative, sur la base de {HOURS_PER_MONTH} h de cours par mois.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROMOTIONS                                                         */
/* ------------------------------------------------------------------ */
function PromoManager({ profId }: { profId: string }) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [missingTable, setMissingTable] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [discount, setDiscount] = useState('');
  const [endDate, setEndDate] = useState(inDays(7));

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('promotions')
      .select('*')
      .eq('professor_id', profId)
      .order('created_at', { ascending: false });
    if (err) setMissingTable(true);
    else { setMissingTable(false); setPromos((data as Promo[]) || []); }
    setLoading(false);
  }, [profId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel(`promos-${profId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions', filter: `professor_id=eq.${profId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profId, load]);

  const live = promos.filter(isLivePromo);
  const boost = Math.min(live.reduce((a, p) => a + p.likes_count, 0), BOOST_CAP);
  const totalLikes = promos.reduce((a, p) => a + p.likes_count, 0);
  const canCreate = live.length < MAX_ACTIVE_PROMOS;

  const create = async () => {
    setError('');
    if (title.trim().length < 3) return setError('Le titre doit contenir au moins 3 caractères.');
    if (body.trim().length < 10) return setError('Décrivez votre promotion en au moins 10 caractères.');
    const d = Number(discount);
    if (discount && (!Number.isFinite(d) || d < 1 || d > 90)) return setError('La réduction doit être entre 1 et 90 %.');

    setSaving(true);
    const { error: err } = await supabase.from('promotions').insert({
      professor_id: profId,
      title: title.trim(),
      body: body.trim(),
      discount_percent: discount ? d : null,
      ends_at: new Date(`${endDate}T23:59:59`).toISOString(),
    });
    setSaving(false);
    if (err) return setError(err.message.includes('row-level security') ? "Publication refusée par la base (droits RLS) : la connexion du professeur n'est pas reconnue." : err.message);
    setTitle(''); setBody(''); setDiscount(''); setEndDate(inDays(7));
    load();
  };

  const toggle = async (p: Promo) => {
    setError('');
    const { data, error: err } = await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id).select('id');
    if (err) return setError(err.message);
    if (!data?.length) return setError('Modification refusée par la base (droits RLS).');
    load();
  };

  const remove = async (p: Promo) => {
    if (!confirm('Supprimer cette promotion ? Ses likes seront perdus.')) return;
    setError('');
    const { data, error: err } = await supabase.from('promotions').delete().eq('id', p.id).select('id');
    if (err) return setError(err.message);
    if (!data?.length) return setError('Suppression refusée par la base (droits RLS).');
    load();
  };

  const st = 'pm-display text-xl font-bold leading-7';

  if (missingTable) {
    return (
      <section className="pm-sheet p-6 flex gap-3 items-start" style={{ borderColor: 'var(--red)' }}>
        <Info className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
        <div>
          <p className="font-bold">Les promotions ne sont pas encore activées.</p>
          <p className="text-sm pm-muted mt-1">Exécutez le fichier <code>supabase_dashboard.sql</code> dans le SQL Editor de Supabase, puis rechargez la page.</p>
        </div>
      </section>
    );
  }

  const stats = [
    { label: 'Promotions actives', value: `${live.length}/${MAX_ACTIVE_PROMOS}`, hint: '', icon: Megaphone },
    { label: 'Likes reçus (total)', value: String(totalLikes), hint: '', icon: Heart },
    { label: 'Bonus de classement', value: `+${boost}`, hint: `plafonné à ${BOOST_CAP}`, icon: Flame },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="pm-sheet p-5 flex items-center gap-4">
              <span className="pm-icon shrink-0"><Icon className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold pm-muted">{s.label}</p>
                <p className="pm-display pm-num text-3xl font-extrabold leading-none mt-1" style={i === 2 ? { color: 'var(--accent-ink)' } : undefined}>{s.value}</p>
                {s.hint && <p className="text-xs pm-muted mt-1">{s.hint}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="pm-sheet xl:col-span-5 p-6">
          <h3 className={st}>Nouvelle promotion</h3>
          <p className="text-sm pm-muted mt-1">Elle s&apos;affiche sur votre profil public. Chaque like d&apos;un parent vous fait monter dans la liste des professeurs. Les commentaires sont interdits.</p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-bold">Titre</span>
              <input className="pm-input mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ex : Pack révision du Bac" />
            </label>

            <label className="block">
              <span className="flex justify-between text-sm font-bold">Description <span className="pm-muted font-medium pm-num">{body.length}/280</span></span>
              <textarea className="pm-input mt-1.5 resize-none" value={body} onChange={(e) => setBody(e.target.value)} maxLength={280} rows={4}
                placeholder="Ex : -20 % sur le 1er mois pour toute inscription avant le 30." />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-bold">Réduction (%)</span>
                <input className="pm-input mt-1.5" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/\D/g, '').slice(0, 2))} inputMode="numeric" placeholder="Optionnel" />
              </label>
              <label className="block">
                <span className="text-sm font-bold">Valable jusqu&apos;au</span>
                <input className="pm-input mt-1.5" type="date" value={endDate} min={inDays(1)} max={inDays(90)} onChange={(e) => setEndDate(e.target.value)} />
              </label>
            </div>

            {error && <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>{error}</p>}

            <button onClick={create} disabled={saving || !canCreate} className="pm-btn pm-btn-blue w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}Publier la promotion
            </button>
            {!canCreate && <p className="text-xs pm-muted text-center">Vous avez déjà {MAX_ACTIVE_PROMOS} promotions actives. Désactivez-en une pour en publier une nouvelle.</p>}
          </div>
        </div>

        <div className="pm-sheet xl:col-span-7 p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className={st}>Mes promotions</h3>
            {boost > 0 && <span className="pm-pill"><Flame className="size-3.5" />Bonus de visibilité : +{boost}</span>}
          </div>

          {loading ? (
            <div className="py-10 grid place-items-center"><Loader2 className="size-5 animate-spin pm-muted" /></div>
          ) : promos.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="font-bold">Aucune promotion pour l&apos;instant</p>
              <p className="text-sm pm-muted">Publiez votre première offre : chaque like vous fait monter dans la liste.</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--edge)]">
              {promos.map((p) => {
                const isLive = isLivePromo(p);
                const expired = new Date(p.ends_at).getTime() <= Date.now();
                return (
                  <li key={p.id} className="py-4 flex gap-4" style={{ opacity: isLive ? 1 : 0.6 }}>
                    <div className="shrink-0 w-14 text-center">
                      <Heart className="size-6 mx-auto" style={{ color: 'var(--red)', fill: p.likes_count > 0 ? 'var(--red)' : 'none' }} />
                      <p className="pm-display pm-num text-xl font-bold leading-none mt-1">{p.likes_count}</p>
                      <p className="text-[10px] pm-muted">likes</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{p.title}</p>
                        {p.discount_percent && <span className="pm-pill"><Tag className="size-3" />-{p.discount_percent}%</span>}
                      </div>
                      <p className="text-sm pm-muted mt-1 leading-relaxed">{p.body}</p>
                      <p className="text-[11px] mt-2 font-semibold" style={{ color: isLive ? 'var(--green)' : 'var(--muted)' }}>
                        {expired ? 'Expirée' : !p.is_active ? 'Désactivée' : 'Active'} · jusqu&apos;au {new Date(p.ends_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {!expired && (
                        <button onClick={() => toggle(p)} aria-label={p.is_active ? 'Désactiver' : 'Activer'} title={p.is_active ? 'Désactiver' : 'Activer'} className="pm-btn pm-btn-ghost size-8">
                          <Power className="size-3.5" />
                        </button>
                      )}
                      <button onClick={() => remove(p)} aria-label="Supprimer" title="Supprimer" className="pm-btn pm-btn-ghost size-8" style={{ color: 'var(--red)' }}>
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function ProfDashboard() {
  const router = useRouter();
  const [profData, setProfData] = useState<Professor | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewTimes, setViewTimes] = useState<number[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [demandeSubTab, setDemandeSubTab] = useState<'accepted' | 'pending'>('accepted');
  const [demandesOpen, setDemandesOpen] = useState(true);
  const [timeRange, setTimeRange] = useState<Range>('semaine');

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [packQty, setPackQty] = useState(1);
  const [goal, setGoal] = useState(5);
  const [copied, setCopied] = useState('');
  const [origin, setOrigin] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok = false) => {
    setNotice({ msg, ok });
    setTimeout(() => setNotice(null), 5000);
  };

  const dark = isDarkMode;
  const theme = dark ? 'pm-dark' : 'pm-light';

  useEffect(() => {
    try { setIsDarkMode(localStorage.getItem('prof_theme') === 'dark'); } catch {}
    setOrigin(window.location.origin);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    try { localStorage.setItem('prof_theme', next ? 'dark' : 'light'); } catch {}
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/connexion');
  };

  const changeGoal = async (v: number) => {
    const next = Math.min(Math.max(v, 1), 50);
    setGoal(next);
    try { if (profData) localStorage.setItem(`prof_goal_${profData.id}`, String(next)); } catch {}
    if (!profData) return;
    const { data, error } = await supabase.from('professors').update({ monthly_goal: next }).eq('id', profData.id).select('id');
    if (error || !data?.length) {
      flash(error ? `Objectif non enregistré dans la base : ${error.message}` : "Objectif non enregistré : la base a refusé la modification (droits RLS).");
    }
  };

  const toggleAvailability = async () => {
    if (!profData) return;
    const next = !isAvailable;
    setIsAvailable(next);
    const { data, error } = await supabase.from('professors').update({ available: next }).eq('id', profData.id).select('id');
    if (error || !data?.length) {
      setIsAvailable(!next);
      flash(error ? `Disponibilité inchangée : ${error.message}` : 'Disponibilité inchangée : la base a refusé la modification (droits RLS).');
    }
  };

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch {}
  };

  const goTo = (tab: Tab) => { setActiveTab(tab); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const refresh = useCallback(async (id: string, rawEmail: string) => {
    const email = rawEmail.toLowerCase().trim();
    const [leadsRes, viewsRes, balRes] = await Promise.all([
      supabase.from('leads').select('*').ilike('professor_email', email),
      supabase.from('profile_views').select('viewed_at').eq('professor_id', id)
        .gte('viewed_at', new Date(Date.now() - 800 * DAY).toISOString()),
      supabase.from('professors').select('leads_restants').eq('id', id).maybeSingle(),
    ]);
    if (!leadsRes.error) setLeads((leadsRes.data as Lead[]) || []);
    if (!viewsRes.error) setViewTimes(toTimes(viewsRes.data || [], 'viewed_at'));
    setLoadError(
      leadsRes.error ? `Demandes : ${leadsRes.error.message}`
      : viewsRes.error ? `Vues du profil : ${viewsRes.error.message}`
      : balRes.error ? `Solde de leads : ${balRes.error.message}`
      : ''
    );
    if (balRes.data) setProfData((p) => (p ? { ...p, leads_restants: (balRes.data as any).leads_restants } : p));
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const rawEmail =
          user?.email || localStorage.getItem('professor_email') || localStorage.getItem('profEmail') ||
          localStorage.getItem('user_email') || localStorage.getItem('email');
        const storedId = localStorage.getItem('professor_id') || localStorage.getItem('user_id');

        if (!rawEmail && !storedId) { router.push('/connexion'); return; }

        let prof: Professor | null = null;
        if (storedId) prof = await fetchProfessor((q) => q.eq('id', storedId));
        if (!prof && rawEmail) prof = await fetchProfessor((q) => q.ilike('email', rawEmail.trim()));
        if (!prof || !alive) return;

        setProfData(prof);
        setIsAvailable(prof.available ?? true);
        const g = Number(prof.monthly_goal) || Number(localStorage.getItem(`prof_goal_${prof.id}`)) || 5;
        setGoal(g);
        await refresh(String(prof.id), prof.email || rawEmail || '');
      } catch (err) {
        console.error('Erreur dashboard:', err);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [router, refresh]);

  useEffect(() => {
    if (!profData?.id || !profData.email) return;
    const id = String(profData.id);
    const email = profData.email;
    const sync = () => refresh(id, email);

    const channel = supabase
      .channel(`leads-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `professor_email=eq.${email}` }, sync)
      .subscribe();
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(sync, REFRESH_MS);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [profData?.id, profData?.email, refresh]);

  const profFullName = profData
    ? `${profData['Prénom'] || ''} ${profData['Nom'] || ''}`.trim() || profData.email || 'Professeur'
    : 'Professeur';
  const profImage: string = profData?.['photo_URL'] || '';
  const subjects = asList(profData?.matiere);
  const levels = asList(profData?.niveau);
  const courseTypes = asList(profData?.['Type_cours']);
  const subjectName = subjects.join(', ') || 'Soutien scolaire';
  const cityName: string = profData?.ville || 'Maroc';
  const tarif = toNumber(profData?.tarif);

  const stats = useMemo(() => {
    const now = new Date();
    const buckets = buildBuckets(timeRange, now);
    const from = buckets[0].start;
    const to = buckets[buckets.length - 1].end;
    const prevFrom = from - (to - from);

    const leadTimes = toTimes(leads, 'lead_date');
    const acceptedTimes = toTimes(leads.filter((l) => isAccepted(l.status)), 'lead_date');

    const points: Point[] = buckets.map((b) => ({
      label: b.label, views: countIn(viewTimes, b.start, b.end), leads: countIn(leadTimes, b.start, b.end),
    }));

    const views = countIn(viewTimes, from, to);
    const prevViews = countIn(viewTimes, prevFrom, from);
    const leadsIn = countIn(leadTimes, from, to);
    const prevLeadsIn = countIn(leadTimes, prevFrom, from);

    const acceptedAll = leads.filter((l) => isAccepted(l.status)).length;
    const pendingAll = leads.filter((l) => isPending(l.status)).length;
    const refusedAll = leads.length - acceptedAll - pendingAll;
    const decided = acceptedAll + refusedAll;
    const acceptRate = decided > 0 ? Math.round((acceptedAll / decided) * 100) : 0;
    const conv = views > 0 ? (leadsIn / views) * 100 : 0;

    const today = startOfDay(now);
    const leads30 = countIn(leadTimes, today - 29 * DAY, today + DAY);
    const perDay = leads30 / 30;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const acceptedThisMonth = countIn(acceptedTimes, monthStart, today + DAY);

    const heat: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0));
    let heatTotal = 0;
    viewTimes.forEach((t) => {
      if (t < today - 90 * DAY) return;
      const d = new Date(t);
      heat[d.getDay()][Math.floor(d.getHours() / 4)]++;
      heatTotal++;
    });
    let best = { d: 0, s: 0, v: 0 };
    heat.forEach((row, d) => row.forEach((v, s) => { if (v > best.v) best = { d, s, v }; }));

    const pendingSorted = leads
      .filter((l) => isPending(l.status))
      .sort((a, b) => new Date(a.lead_date || 0).getTime() - new Date(b.lead_date || 0).getTime());

    return {
      points, views, prevViews, leadsIn, prevLeadsIn, acceptedAll, pendingAll, decided,
      acceptRate, conv, perDay, leads30, acceptedThisMonth, heat, heatTotal, best,
      pendingSorted, oldestPending: pendingSorted[0],
      topSubjects: topCounts(leads.flatMap((l) => asList(l.student_subjects))),
      topCities: topCounts(leads.map((l) => String(l.student_city || ''))),
      viewsDelta: delta(views, prevViews), leadsDelta: delta(leadsIn, prevLeadsIn),
    };
  }, [leads, viewTimes, timeRange]);

  const leadBalance = Number(profData?.leads_restants ?? 0);
  const isLow = leadBalance <= LOW_LEADS_THRESHOLD;
  const autonomyDays = stats.perDay > 0 ? Math.floor(leadBalance / stats.perDay) : null;

  const costPerLead = PACK_PRICE_DH / LEADS_PER_PACK;
  const monthlyPerStudent = tarif * HOURS_PER_MONTH;
  const roiMultiple = costPerLead > 0 && monthlyPerStudent > 0 ? Math.round(monthlyPerStudent / costPerLead) : 0;
  const breakEvenHours = tarif > 0 ? Math.ceil((PACK_PRICE_DH / tarif) * 10) / 10 : 0;

  const missingLeads = Math.max(0, stats.leads30 - leadBalance);
  const suggestedPacks = Math.max(1, Math.ceil(missingLeads / LEADS_PER_PACK));
  const publicUrl = profData ? `${origin}/professeurs/${profData.id}` : '';

  const completeness = useMemo(() => {
    if (!profData) return { score: 0, missing: [] as string[] };
    const checks: [string, boolean][] = [
      ['Photo de profil', !!profImage],
      ['Description', !!String(profData.bio || '').trim()],
      ['Matière', subjects.length > 0],
      ['Niveau', levels.length > 0],
      ['Ville', !!profData.ville],
      ['Tarif horaire', tarif > 0],
      ['Type de cours', courseTypes.length > 0],
      ['Disponibilités', asList(profData.disponibilites).length > 0],
      ['Expérience', !!String(profData.experience || '').trim()],
      ['Téléphone', !!String(profData.telephone || '').trim()],
    ];
    const done = checks.filter(([, ok]) => ok).length;
    return { score: Math.round((done / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([l]) => l) };
  }, [profData, profImage, subjects, levels, courseTypes, tarif]);

  const score20 = Math.round((completeness.score / 100) * 20);
  const gradeComment = score20 >= 18 ? 'Excellent !' : score20 >= 15 ? 'Bien.' : score20 >= 10 ? 'Peut mieux faire.' : 'Profil à compléter.';

  const queue = useMemo(() => {
    if (stats.pendingSorted.length > 0) return { rows: stats.pendingSorted.slice(0, 5), pending: true };
    const recent = [...leads].sort((a, b) => new Date(b.lead_date || 0).getTime() - new Date(a.lead_date || 0).getTime()).slice(0, 5);
    return { rows: recent, pending: false };
  }, [leads, stats.pendingSorted]);

  const todo: { text: string; cta?: string; kind: TodoKind } = useMemo(() => {
    if (!isAvailable) return { text: 'Vous êtes masqué : les élèves ne peuvent pas vous contacter.', cta: 'Me rendre disponible', kind: 'available' };
    if (leadBalance === 0) return { text: "Vous n'avez plus de leads : vous ne voyez plus les nouvelles demandes.", cta: 'Recharger mes leads', kind: 'credits' };
    if (stats.oldestPending) return { text: `Une demande attend votre réponse depuis ${since(stats.oldestPending.lead_date)}.`, cta: 'Répondre aux demandes', kind: 'pending' };
    if (completeness.missing[0]) return { text: `Pour inspirer confiance aux parents, complétez votre profil : ${completeness.missing[0].toLowerCase()}.`, cta: 'Compléter mon profil', kind: 'profile' };
    if (stats.heatTotal > 0) return { text: `Vos visiteurs viennent surtout le ${WEEKDAYS_FULL[stats.best.d]} entre ${SLOTS[stats.best.s]}. Soyez joignable à ce moment.`, kind: 'none' };
    return { text: 'Partagez votre lien de profil pour recevoir vos prochaines demandes.', cta: 'Partager mon profil', kind: 'share' };
  }, [isAvailable, leadBalance, stats.oldestPending, stats.heatTotal, stats.best, completeness.missing]);

  const runTodo = () => {
    switch (todo.kind) {
      case 'available': return toggleAvailability();
      case 'credits': return goTo('credits');
      case 'pending': setDemandeSubTab('pending'); return goTo('demandes');
      case 'profile': return router.push('/prof/profile');
      case 'share': return goTo('publicites');
    }
  };

  if (loading) {
    return (
      <div className={`pm ${theme} min-h-screen flex flex-col items-center justify-center gap-5`}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="pm-sheet px-8 py-7 flex flex-col items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-xl font-extrabold pm-display text-lg" style={{ background: 'var(--blue)', color: 'var(--onblue)' }}>P</span>
          <p className="pm-display text-lg font-bold">Préparation de votre espace…</p>
          <div className="w-52 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--rule)' }}>
            <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: 'var(--blue)' }} />
          </div>
        </div>
      </div>
    );
  }

  const rangeLabel = timeRange === 'semaine' ? '7 derniers jours' : timeRange === 'mois' ? '30 derniers jours' : '12 derniers mois';
  const prevLabel = timeRange === 'semaine' ? 'sem. préc.' : timeRange === 'mois' ? 'mois préc.' : 'année préc.';
  const labelEvery = timeRange === 'mois' ? 5 : 1;
  const firstName = (profData?.['Prénom'] as string) || profFullName.split(' ')[0];
  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCap = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const orderMsg = `Bonjour ProfMaroc, je souhaite recharger mes leads.\n\nProfesseur : ${profFullName}\nEmail : ${profData?.email || ''}\nRéférence : ${profData?.id}\nQuantité : ${packQty} recharge(s) = ${packQty * LEADS_PER_PACK} leads\nMontant : ${packQty * PACK_PRICE_DH} DH`;
  const orderUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(orderMsg)}`;

  const shareText = `Je donne des cours de ${subjectName} à ${cityName}${tarif ? ` (${tarif} MAD/h)` : ''}. Retrouvez mon profil vérifié sur ProfMaroc : ${publicUrl}`;
  const bioText = `${subjectName} • ${cityName} • 1er cours offert ${publicUrl}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;

  const navCls = (active: boolean) =>
    `relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${active ? 'pm-nav-on' : 'pm-nav'}`;

  const statusInfo = (s?: string) =>
    isAccepted(s) ? { t: 'Accepté', c: 'var(--green)' } : isPending(s) ? { t: 'À traiter', c: 'var(--blue)' } : { t: 'Refusé', c: 'var(--red)' };

  const kpis: { k: string; icon: typeof Eye; label: string; value: string | number; sub: string; badge: ReactNode; onClick?: () => void }[] = [
    { k: 'views', icon: Eye, label: 'Vues du profil', value: stats.views, sub: `contre ${stats.prevViews} (${prevLabel})`, badge: <Delta {...stats.viewsDelta} /> },
    { k: 'req', icon: Inbox, label: 'Demandes reçues', value: stats.leadsIn, sub: `contre ${stats.prevLeadsIn} (${prevLabel})`, badge: <Delta {...stats.leadsDelta} />, onClick: () => { setDemandeSubTab(stats.pendingAll > 0 ? 'pending' : 'accepted'); goTo('demandes'); } },
    { k: 'conv', icon: Percent, label: 'Visiteurs qui écrivent', value: `${stats.conv.toFixed(1)}%`, sub: 'demandes ÷ vues, sur la période', badge: null },
    { k: 'rate', icon: CheckCircle2, label: "Taux d'acceptation", value: `${stats.acceptRate}%`, sub: stats.decided > 0 ? `${stats.acceptedAll} acceptée(s) sur ${stats.decided} traitée(s)` : 'Aucune demande traitée', badge: null },
  ];

  const sectionTitle = 'pm-display text-xl font-bold leading-7';

  return (
    <div className={`pm ${theme} min-h-screen flex transition-colors duration-300`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {notice && (
        <div role="status" className="pm-sheet fixed bottom-5 right-5 z-[60] max-w-sm px-4 py-3 text-sm font-semibold"
          style={{ borderColor: notice.ok ? 'var(--green)' : 'var(--red)' }}>
          {notice.msg}
        </div>
      )}

      {/* ============================ SIDEBAR ============================ */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r pm-edge transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]'}`}
        style={{ background: 'var(--side)' }}>
        <div className={`flex h-16 items-center justify-between px-4 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <button onClick={() => goTo('overview')} className="flex items-center gap-2.5 text-left cursor-pointer">
            <Logo size="md" markOnly />
            <span className={`pm-display text-lg font-bold tracking-tight ${collapsed ? 'lg:hidden' : ''}`}>prof<span style={{ color: 'var(--blue)' }}>maroc</span></span>
          </button>
          <button onClick={() => setCollapsed(!collapsed)} aria-label="Réduire le menu" className={`pm-btn pm-btn-ghost hidden size-7 lg:flex ${collapsed ? 'lg:hidden' : ''}`}>
            <ChevronsLeft className="size-4" />
          </button>
          <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="pm-btn pm-btn-ghost size-7 lg:hidden"><X className="size-4" /></button>
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} aria-label="Ouvrir le menu" className="pm-btn pm-btn-ghost mx-auto mt-2 hidden size-8 lg:flex">
            <ChevronsRight className="size-4" />
          </button>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <button onClick={() => goTo('overview')} className={navCls(activeTab === 'overview')}>
            <LayoutGrid className="size-[18px]" />
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Vue d&apos;ensemble</span>
          </button>

          <div>
            <button onClick={() => { setActiveTab('demandes'); setDemandesOpen(!demandesOpen); }}
              className={`${navCls(activeTab === 'demandes')} justify-between`}>
              <span className="flex items-center gap-3">
                <span className="relative">
                  <Users className="size-[18px]" />
                  {stats.pendingAll > 0 && <span className="absolute -top-1 -right-1 size-2 rounded-full ring-2" style={{ background: 'var(--blue)', ['--tw-ring-color' as any]: 'var(--side)' }} />}
                </span>
                <span className={collapsed ? 'lg:hidden' : ''}>Demandes</span>
              </span>
              {!collapsed && <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${demandesOpen ? 'rotate-180' : ''}`} />}
            </button>

            {demandesOpen && !collapsed && (
              <div className="pm-edge ml-5 mt-1 space-y-0.5 border-l pl-3">
                {([
                  { key: 'accepted', label: 'Étudiants acceptés', icon: CheckCircle2, n: stats.acceptedAll },
                  { key: 'pending', label: 'Demandes en attente', icon: Clock, n: stats.pendingAll },
                ] as const).map((s) => {
                  const Icon = s.icon;
                  const active = activeTab === 'demandes' && demandeSubTab === s.key;
                  return (
                    <button key={s.key} onClick={() => { setActiveTab('demandes'); setDemandeSubTab(s.key); setMobileOpen(false); }}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${active ? 'pm-nav-on' : 'pm-nav'}`}>
                      <span className="flex items-center gap-2"><Icon className="size-3.5" />{s.label}</span>
                      <span className="pm-num text-[11px] font-bold" style={{ color: s.key === 'pending' && s.n > 0 ? 'var(--blue)' : undefined }}>{s.n}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => goTo('credits')} className={navCls(activeTab === 'credits')}>
            <Coins className="size-[18px]" />
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Leads et crédits</span>
          </button>

          <button onClick={() => goTo('publicites')} className={navCls(activeTab === 'publicites')}>
            <Megaphone className="size-[18px]" />
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Gérer mes publicités</span>
          </button>

          <Link href="/prof/profile" onClick={() => setMobileOpen(false)} className={navCls(false)}>
            <User className="size-[18px]" />
            <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>Mon profil</span>
          </Link>
        </nav>

        <div className="pm-edge border-t p-3">
          <button onClick={handleLogout} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--rule)] cursor-pointer ${collapsed ? 'lg:justify-center lg:px-0' : ''}`} style={{ color: 'var(--red)' }}>
            <LogOut className="size-[18px]" /><span className={collapsed ? 'lg:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ============================ MAIN ============================ */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b pm-edge backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--sheet) 90%, transparent)' }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-end">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button onClick={() => goTo('credits')} className="pm-btn pm-btn-ghost px-3 py-1.5 text-xs" style={isLow ? { color: 'var(--red)', borderColor: 'var(--red)' } : undefined}>
                <Coins className="size-3.5" /><span className="pm-num">{leadBalance} leads</span>
              </button>

              <button onClick={toggleAvailability} aria-pressed={isAvailable}
                title={isAvailable ? 'Visible : cliquez pour passer indisponible' : 'Masqué : cliquez pour redevenir disponible'}
                className="pm-btn pm-btn-ghost px-3 py-1.5 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: isAvailable ? 'var(--green)' : 'var(--red)' }} />
                <span className="hidden md:inline">{isAvailable ? 'Disponible' : 'Indisponible'}</span>
              </button>

              <button onClick={toggleTheme} aria-label={dark ? 'Passer en thème clair' : 'Passer en thème sombre'} className="pm-btn pm-btn-ghost size-9">
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="pm-btn pm-btn-ghost gap-2 p-1 pr-2.5">
                  <span className="size-8 rounded-full overflow-hidden grid place-items-center text-xs font-bold" style={{ background: 'var(--hl)', color: 'var(--accent-ink)' }}>
                    {profImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profImage} alt="" className="w-full h-full object-cover" />
                    ) : (profFullName[0] || 'P').toUpperCase()}
                  </span>
                  <span className="text-xs font-bold hidden sm:inline">{firstName}</span>
                  <ChevronDown className="size-3.5 pm-muted" />
                </button>

                {showProfileMenu && (
                  <div className="pm-sheet absolute right-0 mt-2 w-60 p-2 z-50">
                    <div className="px-3 py-2 border-b pm-edge mb-1">
                      <p className="text-xs font-bold truncate">{profFullName}</p>
                      <p className="text-[11px] pm-muted truncate">{profData?.email || 'Professeur'}</p>
                    </div>
                    <Link href="/prof/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--rule)]"><User className="size-4" />Mon profil</Link>
                    {profData && <Link href={`/professeurs/${profData.id}`} onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--rule)]"><ExternalLink className="size-4" />Voir mon profil public</Link>}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-[var(--rule)]" style={{ color: 'var(--red)' }}><LogOut className="size-4" />Se déconnecter</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="pm-paper flex-1">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-8">

            {loadError && (
              <div role="alert" className="pm-sheet flex items-start gap-3 p-4" style={{ borderColor: 'var(--red)' }}>
                <Info className="size-5 shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold">Certaines données ne se chargent pas.</p>
                  <p className="text-xs pm-muted mt-0.5 break-words">{loadError}</p>
                </div>
              </div>
            )}

            {/* ===================== VUE D'ENSEMBLE ===================== */}
            {activeTab === 'overview' && (
              <>
                <section className="pm-sheet relative overflow-hidden p-6 sm:p-8">
                  <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full"
                    style={{ background: 'radial-gradient(closest-side, var(--hl), transparent)' }} />
                  <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="min-w-0 max-w-2xl">
                      <span className="pm-pill"><Sparkles className="size-3" />{todayCap}</span>
                      <h1 className="pm-display text-[38px] sm:text-[50px] font-extrabold leading-[1.05] mt-3">
                        Bonjour <span style={{ color: 'var(--blue)' }}>{firstName}</span>
                      </h1>
                      <div className="mt-4 flex items-start gap-3 rounded-xl border pm-edge p-4" style={{ background: 'var(--paper)' }}>
                        <Info className="size-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-ink)' }} />
                        <p className="text-[15px] leading-6 font-semibold">{todo.text}</p>
                      </div>
                      {todo.cta && (
                        <button onClick={runTodo} className="pm-btn pm-btn-dark mt-5 px-5 py-3 text-sm">{todo.cta}<ChevronRight className="size-4" /></button>
                      )}
                    </div>
                    <Grade score20={score20} comment={gradeComment} missing={completeness.missing} />
                  </div>
                </section>

                <section>
                  <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <span className="pm-pill">Activité</span>
                      <h3 className={`${sectionTitle} mt-2`}>Vos chiffres sur les {rangeLabel}</h3>
                    </div>
                    <div className="pm-seg" role="tablist" aria-label="Période">
                      {(['semaine', 'mois', 'annee'] as const).map((r) => (
                        <button key={r} role="tab" aria-selected={timeRange === r} onClick={() => setTimeRange(r)}
                          className={`px-3.5 py-1.5 rounded-[10px] text-sm font-bold cursor-pointer transition-all ${timeRange === r ? 'bg-[var(--sheet)] shadow-sm' : 'pm-muted hover:text-[var(--ink)]'}`}>
                          {r === 'semaine' ? 'Semaine' : r === 'mois' ? 'Mois' : 'Année'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpis.map((c) => {
                      const Icon = c.icon;
                      const Wrap: any = c.onClick ? 'button' : 'div';
                      return (
                        <Wrap key={c.k} onClick={c.onClick}
                          className={`pm-sheet text-left p-5 ${c.onClick ? 'cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg' : ''}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="pm-icon"><Icon className="size-5" /></span>
                            {c.badge}
                          </div>
                          <p className="text-sm font-semibold pm-muted mt-4">{c.label}</p>
                          <p className="pm-display pm-num text-[40px] font-extrabold leading-none mt-1.5">{c.value}</p>
                          <p className="text-xs pm-muted mt-2">{c.sub}</p>
                        </Wrap>
                      );
                    })}
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="pm-sheet xl:col-span-8 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h3 className={sectionTitle}>Vues et demandes</h3>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><span className="h-0.5 w-5 rounded" style={{ background: 'var(--blue)' }} />Vues</span>
                        <span className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dotted" style={{ borderColor: 'var(--ink)' }} />Demandes</span>
                      </div>
                    </div>
                    {stats.views === 0 && stats.leadsIn === 0 ? (
                      <div className="h-56 grid place-items-center text-center px-4 rounded-xl border border-dashed pm-edge" style={{ background: 'var(--paper)' }}>
                        <div className="space-y-1">
                          <p className="font-bold">Aucune activité sur cette période</p>
                          <p className="text-sm pm-muted">Vos premières visites arrivent dès que votre lien circule.</p>
                        </div>
                      </div>
                    ) : <AreaChart data={stats.points} labelEvery={labelEvery} />}
                  </div>

                  <div className="pm-sheet xl:col-span-4 p-6 flex flex-col" style={isLow ? { borderColor: 'var(--red)' } : undefined}>
                    <h3 className={sectionTitle}>Mes leads</h3>
                    <p className="pm-display pm-num text-7xl font-extrabold leading-none mt-4" style={{ color: isLow ? 'var(--red)' : undefined }}>{leadBalance}</p>
                    <p className="text-sm mt-1" style={{ color: isLow ? 'var(--red)' : 'var(--muted)', fontWeight: isLow ? 700 : 400 }}>
                      {isLow ? (leadBalance === 0 ? 'Plus de leads : vous ne voyez plus les demandes.' : 'Solde bas : rechargez pour ne rien rater.') : autonomyDays !== null ? `environ ${autonomyDays} jour${autonomyDays > 1 ? 's' : ''} d'autonomie` : '1 lead = 1 demande d’élève'}
                    </p>
                    <div className="mt-5"><Tickets n={leadBalance} low={isLow} /></div>
                    <button onClick={() => goTo('credits')} className="pm-btn pm-btn-blue mt-auto w-full py-3 text-sm" style={{ marginTop: 24 }}>Recharger mes leads</button>
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="pm-sheet xl:col-span-7 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={sectionTitle}>{queue.pending ? 'Demandes à traiter' : 'Dernières demandes'}</h3>
                      {stats.pendingAll > 0 && <span className="pm-pill pm-num">{stats.pendingAll} en attente</span>}
                    </div>

                    {queue.rows.length === 0 ? (
                      <div className="py-10 text-center space-y-1">
                        <p className="font-bold">Aucune demande pour l&apos;instant</p>
                        <p className="text-sm pm-muted">Elles apparaîtront ici dès qu&apos;un parent vous contacte.</p>
                      </div>
                    ) : (
                      <ul className="mt-3 divide-y divide-[var(--edge)]">
                        {queue.rows.map((l, i) => {
                          const name = `${l.student_name || ''} ${l.student_family_name || ''}`.trim() || 'Élève';
                          const subj = asList(l.student_subjects).join(', ');
                          const city = String(l.student_city || '');
                          const grade = String(l.student_grade || '');
                          const st = statusInfo(l.status);
                          const old = isPending(l.status) && l.lead_date && Date.now() - new Date(l.lead_date).getTime() > DAY;
                          return (
                            <li key={l.id ?? i} className="flex items-center gap-3 py-3.5">
                              <span className="relative size-10 shrink-0 rounded-full grid place-items-center font-bold text-sm" style={{ background: 'var(--hl)', color: 'var(--accent-ink)' }}>
                                {name[0]?.toUpperCase()}
                                {l.is_read === false && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[var(--sheet)]" style={{ background: 'var(--blue)' }} aria-label="Non lue" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold truncate">{name}</p>
                                <p className="text-xs pm-muted flex flex-wrap items-center gap-x-3">
                                  {subj && <span className="inline-flex items-center gap-1"><BookOpen className="size-3" />{subj}{grade && ` · ${grade}`}</span>}
                                  {city && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{city}</span>}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-bold" style={{ color: st.c }}>{st.t}</p>
                                <p className="text-[11px]" style={{ color: old ? 'var(--red)' : 'var(--muted)' }}>{timeAgo(l.lead_date)}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {queue.rows.length > 0 && (
                      <button onClick={() => { setDemandeSubTab(stats.pendingAll > 0 ? 'pending' : 'accepted'); goTo('demandes'); }} className="pm-btn pm-btn-ghost mt-4 px-5 py-2.5 text-sm">
                        {stats.pendingAll > 0 ? 'Répondre aux demandes' : 'Gérer mes demandes'}<ChevronRight className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="pm-sheet xl:col-span-5 p-6">
                    <h3 className={sectionTitle}>Ce que demandent les élèves</h3>
                    {stats.topSubjects.length === 0 && stats.topCities.length === 0 ? (
                      <p className="mt-3 text-sm pm-muted">Les matières et villes les plus demandées apparaîtront avec vos premières demandes.</p>
                    ) : (
                      <div className="mt-4 space-y-5">
                        {[{ title: 'Matières', rows: stats.topSubjects }, { title: 'Villes', rows: stats.topCities }].map((g) => g.rows.length > 0 && (
                          <div key={g.title}>
                            <p className="text-sm font-bold mb-2">{g.title}</p>
                            <div className="space-y-2">
                              {g.rows.map(([label, n]) => (
                                <div key={label}>
                                  <div className="flex justify-between text-xs font-semibold mb-1"><span className="truncate">{label}</span><span className="pm-num">{n}</span></div>
                                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--rule)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${(n / g.rows[0][1]) * 100}%`, background: 'var(--blue)' }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="pm-sheet xl:col-span-4 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className={`${sectionTitle} flex items-center gap-2`}><Target className="size-5" style={{ color: 'var(--blue)' }} />Objectif du mois</h3>
                      <div className="flex gap-1">
                        <button onClick={() => changeGoal(goal - 1)} aria-label="Réduire l'objectif" className="pm-btn pm-btn-ghost size-8"><Minus className="size-3.5" /></button>
                        <button onClick={() => changeGoal(goal + 1)} aria-label="Augmenter l'objectif" className="pm-btn pm-btn-ghost size-8"><Plus className="size-3.5" /></button>
                      </div>
                    </div>
                    <p className="mt-3 pm-display pm-num text-5xl font-extrabold leading-none">{stats.acceptedThisMonth}<span className="text-2xl pm-muted font-bold"> sur {goal}</span></p>
                    <p className="text-sm pm-muted mt-1">nouveaux élèves acceptés ce mois-ci</p>
                    <div className="mt-5 flex flex-wrap gap-2" role="img" aria-label={`${stats.acceptedThisMonth} élèves sur ${goal}`}>
                      {Array.from({ length: Math.min(goal, 20) }, (_, i) => {
                        const done = i < stats.acceptedThisMonth;
                        return (
                          <span key={i} className="size-8 rounded-lg grid place-items-center" style={{ border: `2px solid ${done ? 'var(--green)' : 'var(--edge)'}`, background: done ? 'color-mix(in srgb, var(--green) 10%, transparent)' : 'transparent' }}>
                            {done && <Check className="size-5 stroke-[3]" style={{ color: 'var(--green)' }} />}
                          </span>
                        );
                      })}
                    </div>
                    {stats.acceptedThisMonth >= goal && <p className="text-sm font-bold mt-4" style={{ color: 'var(--green)' }}>Objectif atteint, bravo !</p>}
                  </div>

                  <div className="pm-sheet xl:col-span-8 p-6">
                    <h3 className={sectionTitle}>Quand vos visiteurs viennent</h3>
                    <p className="text-sm pm-muted">Vues par jour et par créneau, sur 90 jours</p>
                    {stats.heatTotal === 0 ? (
                      <div className="mt-4 rounded-xl border border-dashed pm-edge py-10 text-center text-sm font-semibold pm-muted" style={{ background: 'var(--paper)' }}>Pas encore assez de visites pour dégager des horaires.</div>
                    ) : (
                      <>
                        <div className="mt-4 overflow-x-auto">
                          <div className="min-w-[440px]">
                            <div className="grid grid-cols-[48px_repeat(6,1fr)] gap-1.5 text-[11px] font-semibold pm-muted mb-1.5">
                              <span />{SLOTS.map((s) => <span key={s} className="text-center">{s}</span>)}
                            </div>
                            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                              <div key={d} className="grid grid-cols-[48px_repeat(6,1fr)] gap-1.5 mb-1.5 items-center">
                                <span className="text-xs font-semibold pm-muted">{WEEKDAYS[d]}</span>
                                {stats.heat[d].map((v, s) => {
                                  const pct = v === 0 ? 0 : Math.round(18 + 82 * (v / Math.max(stats.best.v, 1)));
                                  return (
                                    <div key={s} title={`${WEEKDAYS_FULL[d]} ${SLOTS[s]} : ${v} vue(s)`}
                                      className="h-8 rounded-lg grid place-items-center text-[11px] font-bold pm-num"
                                      style={{ background: v === 0 ? 'var(--rule)' : `color-mix(in srgb, var(--blue) ${pct}%, transparent)`, color: v === 0 ? 'transparent' : pct > 55 ? 'var(--onblue)' : 'var(--ink)' }}>{v}</div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-sm font-semibold"><Flame className="size-4" style={{ color: 'var(--accent-ink)' }} />Meilleur moment : le {WEEKDAYS_FULL[stats.best.d]}, entre {SLOTS[stats.best.s]}.</p>
                      </>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* ===================== DEMANDES ===================== */}
            {activeTab === 'demandes' && <GestionDemandeView />}

            {/* ===================== LEADS ET CRÉDITS ===================== */}
            {activeTab === 'credits' && (
              <>
                <p className="text-[16px] max-w-xl pm-muted">Chaque lead ouvre une demande d&apos;élève. Rechargez en une minute, sans quitter votre tableau de bord.</p>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="pm-sheet xl:col-span-5 p-7">
                    <h3 className={sectionTitle}>Votre solde</h3>
                    <p className="pm-display pm-num text-[88px] font-extrabold leading-none mt-3" style={{ color: isLow ? 'var(--red)' : undefined }}>{leadBalance}</p>
                    <p className="text-sm pm-muted mt-1">leads disponibles</p>
                    <div className="mt-5"><Tickets n={leadBalance} low={isLow} /></div>
                    {isLow && <p className="mt-5 text-sm font-semibold" style={{ color: 'var(--red)' }}>Solde bas : rechargez pour continuer à recevoir des demandes.</p>}
                    <dl className="mt-6 text-sm">
                      {[
                        ['Demandes reçues (30 jours)', String(stats.leads30)],
                        ['Autonomie estimée', autonomyDays !== null ? `${autonomyDays} jour(s)` : 'non calculable'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-baseline justify-between gap-3 py-2 pm-dots">
                          <dt className="pm-muted">{k}</dt><dd className="font-bold pm-num">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="pm-sheet xl:col-span-7 p-7">
                    <div className="flex items-center justify-between">
                      <h3 className={sectionTitle}>Bon de recharge</h3>
                      <Scissors className="size-4 pm-muted" aria-hidden />
                    </div>
                    <div className="mt-4 border-t-2 border-dashed pm-edge pt-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold">Pack de {LEADS_PER_PACK} leads</p>
                          <p className="text-sm pm-muted">{PACK_PRICE_DH} DH le pack, soit {fmt(costPerLead)} DH la demande</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setPackQty(Math.max(1, packQty - 1))} aria-label="Retirer un pack" className="pm-btn pm-btn-ghost size-10"><Minus className="size-4" /></button>
                          <span className="pm-display pm-num w-10 text-center text-3xl font-bold" aria-live="polite">{packQty}</span>
                          <button onClick={() => setPackQty(Math.min(10, packQty + 1))} aria-label="Ajouter un pack" className="pm-btn pm-btn-ghost size-10"><Plus className="size-4" /></button>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-4" style={{ background: 'color-mix(in srgb, var(--green) 9%, transparent)' }}><p className="text-sm pm-muted">Vous recevez</p><p className="pm-display pm-num text-4xl font-extrabold" style={{ color: 'var(--green)' }}>+{packQty * LEADS_PER_PACK}</p><p className="text-xs pm-muted">leads</p></div>
                        <div className="rounded-xl p-4" style={{ background: 'var(--rule)' }}><p className="text-sm pm-muted">Total à payer</p><p className="pm-display pm-num text-4xl font-extrabold">{packQty * PACK_PRICE_DH}</p><p className="text-xs pm-muted">DH</p></div>
                      </div>

                      {stats.leads30 > 0 && (
                        <button onClick={() => setPackQty(Math.min(10, suggestedPacks))} className="mt-6 w-full text-left rounded-xl border pm-edge px-4 py-3 text-sm cursor-pointer transition-colors hover:border-[var(--blue)] hover:bg-[var(--hl)]">
                          {missingLeads === 0
                            ? <>Vous recevez environ <b>{stats.leads30}</b> demandes par mois : votre solde actuel vous couvre.</>
                            : <>Vous recevez environ <b>{stats.leads30}</b> demandes par mois. Nous vous conseillons <b>{suggestedPacks} pack{suggestedPacks > 1 ? 's' : ''}</b>. <span className="font-bold underline" style={{ color: 'var(--blue)' }}>Appliquer</span></>}
                        </button>
                      )}

                      <a href={orderUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn-green mt-6 w-full py-3.5 text-sm">
                        <MessageCircle className="size-5" />Commander sur WhatsApp
                      </a>
                      <p className="mt-3 text-xs pm-muted text-center">Le message contient déjà votre référence. Votre solde se met à jour ici dès la confirmation du paiement.</p>
                      <button onClick={() => copy('ref', String(profData?.id ?? ''))} className="mt-2 mx-auto flex items-center gap-1.5 text-xs font-semibold pm-muted cursor-pointer hover:text-[var(--ink)]">
                        {copied === 'ref' ? <Check className="size-3.5" style={{ color: 'var(--green)' }} /> : <Copy className="size-3.5" />}Ma référence : {String(profData?.id ?? '')}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="pm-sheet p-7 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
                  <h3 className={`${sectionTitle} md:max-w-[200px]`}>Ce que rapporte un lead</h3>
                  <RoiNote tarif={tarif} breakEvenHours={breakEvenHours} monthlyPerStudent={monthlyPerStudent} roiMultiple={roiMultiple} />
                </section>
              </>
            )}

            {/* ===================== PUBLICITÉS ===================== */}
            {activeTab === 'publicites' && (
              <>
                <p className="text-[16px] max-w-xl pm-muted">Publiez vos promotions et partagez votre profil : chaque like des parents vous fait monter dans la liste des professeurs.</p>

                {profData && <PromoManager profId={String(profData.id)} />}

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="xl:col-span-4">
                    <p className="text-sm font-semibold pm-muted mb-3">Votre carte telle que les élèves la voient</p>
                    <div className="pm-sheet overflow-hidden">
                      <div className="relative h-56" style={{ background: 'var(--dark)' }}>
                        {profImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profImage} alt={profFullName} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full grid place-items-center" style={{ color: 'var(--ondark)', opacity: 0.4 }}><User className="size-14" /></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <p className="pm-display text-xl font-bold">{profFullName}</p>
                          <p className="text-xs flex items-center gap-1 text-white/80"><MapPin className="size-3" />{cityName}</p>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0"><p className="text-sm font-bold truncate">{subjectName}</p><p className="pm-display pm-num text-lg font-bold">{tarif > 0 ? tarif : '—'} MAD<span className="text-xs font-medium pm-muted">/h</span></p></div>
                        <span className="pm-pill shrink-0">1er cours offert</span>
                      </div>
                    </div>
                  </div>

                  <div className="pm-sheet xl:col-span-8 p-6 space-y-7">
                    <div>
                      <h3 className={sectionTitle}>Votre lien de profil</h3>
                      <div className="mt-3 flex items-center gap-2 rounded-xl border pm-edge p-1.5 pl-4" style={{ background: 'var(--paper)' }}>
                        <span className="flex-1 truncate text-sm font-semibold">{publicUrl || '…'}</span>
                        <button onClick={() => copy('url', publicUrl)} className="pm-btn pm-btn-blue shrink-0 px-4 py-2 text-xs">
                          {copied === 'url' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied === 'url' ? 'Copié' : 'Copier le lien'}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <a href={waShareUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn-green px-4 py-2.5 text-xs"><MessageCircle className="size-4" />Partager sur WhatsApp</a>
                        <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn-ghost px-4 py-2.5 text-xs"><Share2 className="size-4" />Partager sur Facebook</a>
                      </div>
                    </div>

                    <div>
                      <h3 className={sectionTitle}>Textes prêts à publier</h3>
                      <div className="mt-3 space-y-3">
                        {[
                          { k: 'msg', title: 'Message WhatsApp ou Facebook', text: shareText },
                          { k: 'bio', title: 'Bio Instagram ou TikTok', text: bioText },
                        ].map((t) => (
                          <div key={t.k} className="rounded-xl border pm-edge p-4" style={{ background: 'var(--paper)' }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm font-bold">{t.title}</p>
                              <button onClick={() => copy(t.k, t.text)} className="flex items-center gap-1 text-xs font-bold cursor-pointer" style={{ color: 'var(--blue)' }}>
                                {copied === t.k ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied === t.k ? 'Copié' : 'Copier'}
                              </button>
                            </div>
                            <p className="text-sm pm-muted leading-relaxed">{t.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

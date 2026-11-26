'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { BookOpen, Gift, Gamepad2, Home, Map, Menu, UserRound, X, Star,ScanLine } from 'lucide-react';
import { browserRepository, initialProgress, totalStars, type Progress } from '@/lib/progress';
import { t, type Locale, type Text } from '@/lib/content';

type Store = { progress: Progress; ready: boolean; update: (fn: (value: Progress) => Progress) => void; reset: () => void };
const Context = createContext<Store | null>(null);
export function useProgress() { const ctx = useContext(Context); if (!ctx) throw new Error('Progress provider missing'); return ctx; }
export function useWords() { const { progress } = useProgress(); return (value: Text) => value[progress.locale]; }

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(initialProgress);
  const [ready, setReady] = useState(false);
  useEffect(() => { // Hydrate browser-only progress after SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(browserRepository.load()); setReady(true);
  }, []);
  useEffect(() => { document.documentElement.lang = progress.locale; }, [progress.locale]);
  function update(fn: (value: Progress) => Progress) { setProgress((current) => { const next = fn(current); try { browserRepository.save(next); } catch { /* storage disabled: keep in-memory progress */ } return next; }); }
  function reset() { const next = { ...initialProgress, locale: progress.locale }; try { browserRepository.clear(); browserRepository.save(next); } catch { /* storage disabled */ } setProgress(next); }
  return <Context.Provider value={{ progress, ready, update, reset }}>{children}</Context.Provider>;
}

const links = [
  { href: '/', label: t('Главная', 'Басты бет'), icon: Home },
  { href: '/learn', label: t('Уроки', 'Сабақтар'), icon: Map },
  { href: '/games', label: t('Игры', 'Ойындар'), icon: Gamepad2 },
  { href: '/practice', label: t('AI-тренажёр', 'AI жаттықтырғыш'), icon: ScanLine },
  { href: '/dictionary', label: t('Словарь', 'Сөздік'), icon: BookOpen },
  { href: '/rewards', label: t('Награды', 'Марапаттар'), icon: Gift },
  { href: '/profile', label: t('Профиль', 'Профиль'), icon: UserRound },
];

export function LanguageSwitcher() {
  const { progress, update } = useProgress();
  return <div className="language-switch" role="group" aria-label="Язык / Тіл">
    {(['kk', 'ru'] as Locale[]).map((lang) => <button key={lang} type="button" lang={lang} className={progress.locale === lang ? 'active' : ''} aria-pressed={progress.locale === lang} onClick={() => update((p) => ({ ...p, locale: lang }))}>{lang === 'kk' ? 'Қазақша' : 'Русский'}</button>)}
  </div>;
}
export function Mascot({ small = false, mood = 'happy' }: { small?: boolean; mood?: 'happy' | 'wow' }) {
  const w=useWords();
  return <svg className={small ? 'mascot small' : 'mascot'} viewBox="0 0 280 280" role="img" aria-label={w(t('Мими, проводник по атласу','Мими, атлас бойынша жолсерік'))}>
    <ellipse cx="141" cy="254" rx="95" ry="14" fill="#243746" opacity=".10" />
    <path d="M55 119 C23 44 87 32 112 75 Q140 58 169 75 C202 32 258 46 226 119" fill="#85d7bd" stroke="#294b50" strokeWidth="5" />
    <path d="M61 98 C37 52 84 51 100 83 M180 83 C202 50 241 55 216 99" fill="#b5ead3" />
    <rect x="43" y="78" width="194" height="163" rx="79" fill="#a8e5cc" stroke="#294b50" strokeWidth="5" />
    <ellipse cx="140" cy="160" rx="74" ry="67" fill="#e5fae7" />
    <ellipse cx="109" cy="149" rx="6" ry="9" fill="#294b50" /><ellipse cx="172" cy="149" rx="6" ry="9" fill="#294b50" />
    <ellipse cx="84" cy="170" rx="12" ry="6" fill="#f4a2a0" opacity=".7" /><ellipse cx="195" cy="170" rx="12" ry="6" fill="#f4a2a0" opacity=".7" />
    {mood === 'wow' ? <ellipse cx="140" cy="179" rx="9" ry="12" fill="#294b50" /> : <path d="M126 178 Q140 193 154 178" fill="none" stroke="#294b50" strokeWidth="5" strokeLinecap="round" />}
    <path d="M66 196 C19 183 32 230 69 222 M211 222 C247 232 261 187 218 197" fill="#a8e5cc" stroke="#294b50" strokeWidth="5" strokeLinecap="round" />
    <path d="M100 231 L89 250 M183 231 L194 250" stroke="#294b50" strokeWidth="7" strokeLinecap="round" />
    <path d="M132 62 l7 -18 7 18 18 7 -18 7 -7 18 -7 -18 -18 -7z" fill="#ffd76e" stroke="#294b50" strokeWidth="4" />
  </svg>;
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname(); const w = useWords(); const { progress } = useProgress();
  return <><header className="app-header"><div className="header-inner">
    <Link className="brand" href="/" onClick={() => setOpen(false)}><span className="brand-mark">✳</span> ishara<span>kids</span></Link>
    <nav className="desktop-nav" aria-label={w(t('Основное меню', 'Негізгі мәзір'))}>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={path === href || (href === '/learn' && path.startsWith('/learn/')) ? 'nav-link selected' : 'nav-link'}><Icon size={18} aria-hidden="true" />{w(label)}</Link>)}</nav>
    <div className="header-actions"><span className="star-pill" aria-label={`${w(t('Звёзды', 'Жұлдыздар'))}: ${totalStars(progress)}`}><Star size={18} fill="currentColor" /> {totalStars(progress)}</span><LanguageSwitcher /><button type="button" className="menu-toggle" aria-label={open ? w(t('Закрыть меню', 'Мәзірді жабу')) : w(t('Открыть меню', 'Мәзірді ашу'))} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
  </div></header>{open && <nav className="mobile-nav" aria-label={w(t('Мобильное меню', 'Мобильді мәзір'))}>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)}><Icon size={19} />{w(label)}</Link>)}<Link href="/parents" onClick={() => setOpen(false)}>{w(t('Родителям', 'Ата-аналарға'))}</Link></nav>}</>;
}
export function AppShell({ children }: { children: ReactNode }) { const w = useWords(); return <><AppHeader /><main id="main" className="page-wrap">{children}</main><footer className="site-footer"><div className="container footer-inner"><span>✳ ishara kids · {w(t('Место для первых открытий', 'Алғашқы жаңалықтар мекені'))}</span><Link href="/parents">{w(t('Для родителей и педагогов →', 'Ата-аналар мен ұстаздарға →'))}</Link></div></footer></>; }
export function SectionIntro({ eyebrow, title, description }: { eyebrow: Text; title: Text; description: Text }) { const w = useWords(); return <div className="section-intro"><span className="eyebrow">{w(eyebrow)}</span><h1>{w(title)}</h1><p>{w(description)}</p></div>; }
export function DemoNote() { const w = useWords(); return <div className="demo-note" role="note"><span aria-hidden="true">✦</span><span>{w(t('Демо-упражнение: это не обучение настоящим жестам. Видео и жесты появятся после проверки экспертом.', 'Демо-жаттығу: бұл шынайы ымдарды үйретпейді. Бейне мен ымдар сарапшы тексергеннен кейін пайда болады.'))}</span></div>; }

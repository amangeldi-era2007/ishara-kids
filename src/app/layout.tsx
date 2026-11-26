import type { Metadata } from 'next';
import { AppProvider, AppShell } from '@/components/app-shell';
import './globals.css';
import './atlas.css';
import './release.css';

export const metadata: Metadata = { title: 'Ishara Kids — учимся с радостью', description: 'Демонстрационная обучающая платформа для детей в Казахстане. Учебные материалы проходят экспертную проверку.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main">Перейти к содержимому / Мазмұнға өту</a><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>; }

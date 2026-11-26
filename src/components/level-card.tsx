'use client';

import { Compass } from 'lucide-react';
import { useProgress, useWords } from './app-shell';
import { lessons, t } from '@/lib/content';

const levels = [
  { start: 0, title: t('Первый шаг','Алғашқы қадам') },
  { start: 1, title: t('Следопыт','Із кесуші') },
  { start: 3, title: t('Друг атласа','Атлас досы') },
  { start: 8, title: t('Знаток маршрута','Бағыт білгірі') },
];

export function LevelCard() {
  const w = useWords();
  const { progress } = useProgress();
  const count = lessons.filter(l => progress.completed[l.id] !== undefined).length;
  const index = levels.findLastIndex(level => level.start <= count);
  const current = levels[index];
  const next = levels[index + 1];
  return <section className="card level-card">
    <span className="studio-icon"><Compass size={33} aria-hidden="true"/></span>
    <div><span className="atlas-kicker">{w(t('Уровень','Деңгей'))} {index + 1}</span>
      <h2>{w(current.title)}</h2>
      {next ? <label className="trail-meter">
        {w(t('Уроков до следующего уровня','Келесі деңгейге дейінгі сабақтар'))}: {next.start - count}
        <progress max={next.start - current.start} value={count - current.start}/>
      </label> : <p>{w(t('Ты прошёл весь маршрут!','Бүкіл бағытты аяқтадың!'))}</p>}
    </div>
  </section>;
}

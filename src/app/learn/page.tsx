'use client';
import Link from 'next/link';
import { LockKeyhole, ArrowRight, Check } from 'lucide-react';
import { SectionIntro, useProgress, useWords } from '@/components/app-shell';
import { lessons, t, type Lesson } from '@/lib/content';
import { isUnlocked } from '@/lib/progress';

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const w = useWords();
  const { progress } = useProgress();
  const available = isUnlocked(lesson.id, progress.completed);
  const points = progress.completed[lesson.id];
  return (
    <li className="trail-stop">
      <span className="trail-pin">
        {points !== undefined ? (
          <Check aria-label={w(t('Пройдено', 'Аяқталды'))} />
        ) : (
          index + 1
        )}
      </span>
      <article className="card trail-card">
        <span className="trail-icon" aria-hidden="true">
          {lesson.icon}
        </span>
        <div>
          <h3>{w(lesson.title)}</h3>
          <p>
            {points !== undefined
              ? `★ ${points}`
              : available
                ? w(t('Можно начать', 'Бастауға болады'))
                : w(t('После предыдущего урока', 'Алдыңғы сабақтан кейін'))}
          </p>
        </div>
        {available ? (
          <Link className="btn btn-primary" href={`/learn/${lesson.id}`}>
            {points !== undefined
              ? w(t('Повторить', 'Қайталау'))
              : w(t('Начать', 'Бастау'))}
            <ArrowRight size={16} />
          </Link>
        ) : (
          <LockKeyhole size={20} aria-label={w(t('Закрыто', 'Жабық'))} />
        )}
      </article>
    </li>
  );
}
export default function LearnPage() {
  const w = useWords();
  const { progress } = useProgress();
  const count = lessons.filter((l) => l.id in progress.completed).length;
  return (
    <div className="container">
      <SectionIntro
        eyebrow={t('Атлас · маршрут', 'Атлас · бағыт')}
        title={t('Твоя карта открытий', 'Сенің саяхат картаң')}
        description={t(
          'Начни с разминки. Каждый пройденный урок открывает следующую остановку.',
          'Алдымен жаттығып ал. Әр аяқталған сабақ келесі аялдаманы ашады.',
        )}
      />
      <label className="trail-meter">
        {w(t('Пройдено', 'Аяқталды'))}: {count} / {lessons.length}
        <progress value={count} max={lessons.length} />
      </label>
      {[
        t('Цвет и форма', 'Түс пен пішін'),
        t('В природе', 'Табиғатта'),
        t('Мои первые слова', 'Алғашқы сөздерім'),
      ].map((name, i) => (
        <section key={i} className="trail-unit">
          <span className="atlas-kicker">
            {w(t('Глава', 'Тарау'))} 0{i + 1}
          </span>
          <h2>{w(name)}</h2>
          <ol>
            {lessons.map((l, j) =>
              l.unit === i + 1 ? (
                <LessonCard key={l.id} lesson={l} index={j} />
              ) : null,
            )}
          </ol>
        </section>
      ))}
    </div>
  );
}

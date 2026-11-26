'use client';
import Link from 'next/link';
import { ArrowRight, Map, Compass } from 'lucide-react';
import { AtlasCover } from '@/components/atlas-cover';
import { useWords } from '@/components/app-shell';
import { categories } from '@/data/atlas';
import { t } from '@/lib/content';

export default function HomePage() {
  const w = useWords();
  return (
    <div className="container atlas-home">
      <section className="atlas-hero">
        <div>
          <span className="atlas-kicker">
            <Compass size={18} /> ISHARA KIDS /{' '}
            {w(t('Детский атлас', 'Балалар атласы'))}
          </span>
          <h1>
            {w(t('Открой мир', 'Ым әлемін'))}
            <br />
            <em>
              {w(t('жестов', 'аш'))}
              <span className="sun-dot">.</span>
            </em>
          </h1>
          <p>
            {w(
              t(
                'Пройди с Мими по карте Казахстана: рассматривай картинки, находи пары и собирай звёзды.',
                'Мимимен бірге Қазақстан картасын арала: суреттерді қара, жұптарды тап, жұлдыз жина.',
              ),
            )}
          </p>
          <div className="hero-buttons">
            <Link href="/learn" className="btn btn-primary">
              {w(t('Начать', 'Бастау'))}
              <ArrowRight size={20} />
            </Link>
            <Link href="/dictionary" className="btn btn-light">
              {w(t('Открыть словарь', 'Сөздікті ашу'))}
            </Link>
          </div>
          <small>
            {w(
              t(
                'Демо: сейчас играем с понятиями. Видео жестов ждут проверки.',
                'Демо: әзірге ұғымдармен ойнаймыз. Ым бейнелері тексерілген соң қосылады.',
              ),
            )}
          </small>
          <div className="launch-links">
            <Link className="text-link" href="/practice">
              {w(t('Попробовать AI-тренажёр', 'AI жаттықтырғышын байқап көру'))}{' '}
              →
            </Link>
            <Link className="text-link" href="/dictionary?category=alphabet">
              {w(t('Дактильный алфавит', 'Дактиль әліпбиі'))} →
            </Link>
          </div>
        </div>
        <AtlasCover />
      </section>
      <section className="atlas-section">
        <span className="atlas-kicker">
          <Map size={16} /> 01 / {w(t('Путеводитель', 'Жолсілтеме'))}
        </span>
        <div className="section-head">
          <h2>{w(t('Десять тем для открытий', 'Ашуға болатын он тақырып'))}</h2>
          <Link className="text-link" href="/learn">
            {w(t('Вся карта →', 'Толық карта →'))}
          </Link>
        </div>
        <div className="stamps">
          {categories
            .filter((c) => c.id !== 'discovery')
            .map((c, i) => (
              <Link
                key={c.id}
                href={`/dictionary/?category=${c.id}`}
                className="stamp"
                style={{ background: c.tint }}
              >
                <small>№ {String(i + 1).padStart(2, '0')}</small>
                <span aria-hidden="true">{c.icon}</span>
                <strong>{w(t(c.ru, c.kk))} ↗</strong>
              </Link>
            ))}
        </div>
      </section>
      <section className="banner atlas-family">
        <div>
          <span className="atlas-kicker">
            02 / {w(t('Семейная заметка', 'Отбасына жазба'))}
          </span>
          <h2>{w(t('Что видит ребёнок?', 'Бала не көреді?'))}</h2>
          <p>
            {w(
              t(
                'Карточка помогает понять слово. Для показа жеста нужны проверенное видео и разрешение на публикацию.',
                'Карточка сөзді түсінуге көмектеседі. Ымды көрсету үшін тексерілген бейне мен жариялауға рұқсат қажет.',
              ),
            )}
          </p>
        </div>
        <Link href="/parents" className="btn btn-light">
          {w(t('Родителям', 'Ата-аналарға'))} <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}

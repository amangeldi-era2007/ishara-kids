'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SectionIntro, useWords } from '@/components/app-shell';
import { DictionaryCard } from '@/components/sign-card';
import { categories, signs, officialSources } from '@/data/atlas';
import { surdoSources } from '@/data/dactyl-references';
import { t } from '@/lib/content';

export default function DictionaryPage() {
  return (
    <Suspense fallback={<p role="status">Жүктелуде / Загрузка…</p>}>
      <DictionaryBrowser />
    </Suspense>
  );
}
function DictionaryBrowser() {
  const initial = useSearchParams().get('category');
  const w = useWords();
  const [category, setCategory] = useState(
    categories.some((c) => c.id === initial) ? initial : 'all',
  );
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const filtered = signs.filter(
    (s) =>
      (category === 'all' || category === s.category) &&
      [s.title_kz, s.title_ru].some((v) => v.toLowerCase().includes(needle)),
  );
  return (
    <div className="container">
      <SectionIntro
        eyebrow={t('Полевой атлас · 01', 'Суретті атлас · 01')}
        title={t('Словарь в картинках', 'Суретті сөздік')}
        description={t(
          'Картинки помогают понять слова. В разделе «Алфавит» можно рассмотреть дактильные буквы и открыть видео с движением руки.',
          'Суреттер сөзді түсінуге көмектеседі. «Әліппе» бөлімінде дактиль әріптерін қарап, қол қимылын бейнеден көре аласың.',
        )}
      />
      <p>
        <a
          className="text-link"
          href={officialSources.dictionary}
          target="_blank"
          rel="noreferrer"
        >
          {w(
            t(
              'Официальные видеодемонстрации: «е-Ымдау»',
              'Ресми бейне көрсетілімдер: «е-Ымдау»',
            ),
          )}{' '}
          ↗
        </a>
      </p>
      <label className="field" htmlFor="lookup">
        {w(t('Найди слово', 'Сөзді тап'))}
      </label>
      <input
        id="lookup"
        className="input"
        type="search"
        value={query}
        placeholder={w(t('Например: книга', 'Мысалы: кітап'))}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div
        className="filter-row"
        role="group"
        aria-label={w(t('Темы', 'Тақырыптар'))}
      >
        {[{ id: 'all', ru: 'Все', kk: 'Барлығы' }, ...categories].map((c) => (
          <button
            key={c.id}
            className={category === c.id ? 'active' : ''}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {w(t(c.ru, c.kk))}
          </button>
        ))}
      </div>
      {category === 'alphabet' && (
        <section className="card alphabet-source">
          <h2>
            {w(t('Казахский дактильный алфавит', 'Қазақ дактиль әліпбиі'))}
          </h2>
          <p>
            {w(
              t(
                'Нажми на фото, чтобы открыть его крупнее. Снимок показывает один момент: движение лучше смотреть в видео surdo server или по таблице Центра.',
                'Суретті үлкейту үшін оны бас. Сурет бір сәтті ғана көрсетеді. Қозғалысты surdo server бейнесінен немесе Орталықтың кестесінен қара.',
              ),
            )}
          </p>
          <div className="alphabet-source-links">
            <a
              className="btn btn-primary"
              href={`${officialSources.alphabetPdf}#page=8`}
              target="_blank"
              rel="noreferrer"
            >
              {w(t('Открыть таблицу (PDF)', 'Кестені ашу (PDF)'))} ↗
            </a>
            <a
              className="btn btn-light"
              href={surdoSources.alphabet}
              target="_blank"
              rel="noreferrer"
            >
              {w(t('Плейлист «Әліппе»', '«Әліппе» бейне тізімі'))} ↗
            </a>
          </div>
          {!needle && (
            <nav
              className="alphabet-jump"
              aria-label={w(t('Перейти к букве', 'Әріпке өту'))}
            >
              {filtered.map((entry) => (
                <a
                  key={entry.id}
                  href={`#entry-${entry.id}`}
                  aria-label={w(
                    t(
                      `Перейти к букве ${entry.title_ru}`,
                      `${entry.title_kz} әрпіне өту`,
                    ),
                  )}
                >
                  {w(t(entry.title_ru, entry.title_kz))}
                </a>
              ))}
            </nav>
          )}
        </section>
      )}
      <p role="status">
        {w(t('Найдено карточек', 'Табылған карточкалар'))}: {filtered.length}
      </p>
      {filtered.length ? (
        <div className="grid">
          {filtered.map((s) => (
            <DictionaryCard key={s.id} entry={s} />
          ))}
        </div>
      ) : category === 'alphabet' && !needle ? null : (
        <div className="card">
          <h2>{w(t('Пока ничего не найдено', 'Әзірге ештеңе табылмады'))}</h2>
          <button
            className="btn btn-light"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
          >
            {w(t('Очистить поиск', 'Іздеуді тазалау'))}
          </button>
        </div>
      )}
    </div>
  );
}

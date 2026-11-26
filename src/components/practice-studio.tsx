'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Camera, Cpu, ScanLine } from 'lucide-react';
import { SectionIntro, useProgress, useWords } from './app-shell';
import { HandCamera } from './hand-camera';
import { SignIllustration, VideoLessonCard } from './sign-card';
import { practiceSigns, templates } from '@/data/practice';
import { officialSources } from '@/data/atlas';
import {
  advanceStreak,
  createMatcher,
  type HandFrame,
} from '@/lib/practice-matcher';
import { completeGame } from '@/lib/progress';
import { t } from '@/lib/content';

const matcher = createMatcher({
  ...templates,
  classes: templates.classes.filter((c) =>
    practiceSigns.some((s) => s.id === c.id),
  ),
});
const requiredFrames = 8;

export function PracticeStudio({
  initialSign,
  diagnostic = false,
  embedded = false,
}: {
  initialSign?: string;
  diagnostic?: boolean;
  embedded?: boolean;
}) {
  const w = useWords();
  const { update } = useProgress();
  const [selected, setSelected] = useState(
    initialSign ?? practiceSigns[0]?.id ?? '',
  );
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState({
    count: 0,
    frames: 0,
    distance: 0,
    comparable: false,
  });
  const [result, setResult] = useState<
    'idle' | 'other' | 'uncertain' | 'match'
  >('idle');
  const streak = useRef<ReturnType<typeof advanceStreak>>(null);
  const completed = useRef(false);
  const target = practiceSigns.find((s) => s.id === selected);

  function reset() {
    streak.current = null;
    completed.current = false;
    setSummary({ count: 0, frames: 0, distance: 0, comparable: false });
    setResult('idle');
  }
  function handleFrame(frame: HandFrame) {
    if (completed.current) return;
    const comparison = target ? matcher(frame) : null;
    streak.current = advanceStreak(
      streak.current,
      comparison?.confident ? comparison.id : null,
    );
    const frames = streak.current?.frames ?? 0;
    setSummary({
      count: frame.count,
      frames,
      distance: comparison?.distance ?? 0,
      comparable: Boolean(comparison),
    });
    if (!target || !frame.count || frame.tooFar) return setResult('idle');
    if (!comparison?.confident) return setResult('uncertain');
    if (frames < requiredFrames) return setResult('idle');
    if (comparison.id !== target.id) return setResult('other');
    completed.current = true;
    setResult('match');
    if (!diagnostic) update((p) => completeGame(p, `practice:${target.id}`));
  }

  return (
    <div
      className={
        embedded ? 'practice-page embedded-practice' : 'container practice-page'
      }
    >
      {!embedded && (
        <SectionIntro
          eyebrow={t('Лаборатория движения', 'Қимыл зертханасы')}
          title={
            diagnostic
              ? t('Диагностика AI', 'AI диагностикасы')
              : t('AI-тренажёр', 'AI жаттықтырғыш')
          }
          description={t(
            'Камера находит руки в кадре. Видео остаётся на твоём устройстве.',
            'Камера кадрдағы қолдарды табады. Бейне құрылғыңда қалады.',
          )}
        />
      )}
      <div className="studio-grid">
        <section className="card studio-reference">
          <span className="atlas-kicker">
            <ScanLine size={18} /> {w(t('01 / Образец', '01 / Үлгі'))}
          </span>
          <h2>{w(t('Что повторяем?', 'Нені қайталаймыз?'))}</h2>
          {!embedded && practiceSigns.length > 0 && (
            <label className="field">
              {w(t('Выбери жест', 'Ымды таңда'))}
              <select
                className="input"
                value={selected}
                onChange={(e) => {
                  reset();
                  setSelected(e.target.value);
                }}
              >
                <option value="">
                  {w(t('Только трекинг', 'Тек қолды анықтау'))}
                </option>
                {practiceSigns.map((s) => (
                  <option key={s.id} value={s.id}>
                    {w(t(s.title_ru, s.title_kz))}
                  </option>
                ))}
              </select>
            </label>
          )}
          {target ? (
            <>
              <h3>{w(t(target.title_ru, target.title_kz))}</h3>
              <SignIllustration entry={target} />
              <VideoLessonCard entry={target} />
              <p>{w(t(target.description_ru, target.description_kz))}</p>
            </>
          ) : (
            <>
              <div className="studio-icon">
                <Camera aria-hidden="true" size={46} />
              </div>
              <p>
                {w(
                  t(
                    'Покажи одну или две руки. Посмотри, как точки следуют за пальцами.',
                    'Бір немесе екі қолыңды көрсет. Нүктелер саусақтарыңмен бірге қозғалады.',
                  ),
                )}
              </p>
              <p className="demo-note">
                {w(
                  t(
                    'AI-проверка жеста пока недоступна. Здесь работает обнаружение рук.',
                    'AI әзірге ымды тексермейді. Мұнда қолды анықтау жұмыс істейді.',
                  ),
                )}
              </p>
              <Link className="text-link" href="/dictionary?category=alphabet">
                {w(t('Открыть дактильный алфавит', 'Дактиль әліпбиін ашу'))} →
              </Link>
            </>
          )}
        </section>
        <section className="card studio-camera">
          <span className="atlas-kicker">
            <Camera size={18} /> {w(t('02 / Камера', '02 / Камера'))}
          </span>
          <HandCamera key={attempt} onFrame={handleFrame} onReset={reset} showDelegate={diagnostic} />
          {target && (
            <div className="studio-result">
              <p>
                {summary.comparable
                  ? `${w(t('Расстояние до ближайшего образца', 'Ең жақын үлгіге дейінгі қашықтық'))}: ${summary.distance.toFixed(3)}`
                  : w(t('Нет сравнения', 'Салыстыру жоқ'))}
              </p>
              <p role="status">
                {w(
                  result === 'match'
                    ? t('Молодец! Жест совпал!', 'Жарайсың! Дұрыс орындадың!')
                    : result === 'other'
                      ? t('Попробуй ещё раз!', 'Қайтадан байқап көр!')
                      : result === 'uncertain'
                        ? t(
                            'Не удалось уверенно распознать жест',
                            'Ым сенімді түрде анықталмады',
                          )
                        : t(
                            'Покажи руку в камеру!',
                            'Қолыңды камераға көрсет!',
                          ),
                )}
              </p>
              {result === 'match' && !diagnostic && <strong>★ 10</strong>}
              <div className="hero-buttons">
                <button className="btn btn-light" onClick={reset}>
                  {w(t('Повторить', 'Қайталау'))}
                </button>
                {!embedded && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      reset();
                      const index = practiceSigns.indexOf(target);
                      setSelected(
                        practiceSigns[(index + 1) % practiceSigns.length].id,
                      );
                    }}
                  >
                    {w(t('Следующий жест', 'Келесі ым'))}
                  </button>
                )}
              </div>
            </div>
          )}
          {!target && (
            <button
              className="btn btn-light"
              onClick={() => {
                reset();
                setAttempt((a) => a + 1);
              }}
            >
              {w(t('Сбросить камеру', 'Камераны қайта баптау'))}
            </button>
          )}
        </section>
      </div>
      {diagnostic ? (
        <section className="card studio-diagnostics">
          <h2>
            <Cpu size={22} /> {w(t('Сведения о сеансе', 'Сеанс деректері'))}
          </h2>
          <dl>
            <dt>{w(t('Руки в кадре', 'Кадрдағы қолдар'))}</dt>
            <dd>{summary.count}</dd>
            <dt>
              {w(t('Поддерживаемые классы', 'Қолдау көрсетілетін кластар'))}
            </dt>
            <dd>{practiceSigns.map((s) => s.id).join(', ') || '0'}</dd>
            <dt>
              {w(t('Последовательные кадры', 'Қатарынан алынған кадрлар'))}
            </dt>
            <dd>
              {summary.frames} / {requiredFrames}
            </dd>
            <dt>{w(t('Сравнение', 'Салыстыру'))}</dt>
            <dd>{summary.comparable ? summary.distance.toFixed(4) : '—'}</dd>
          </dl>
          <a className="text-link" href={officialSources.qazsl}>
            QazSL · CC BY 4.0 ↗
          </a>
        </section>
      ) : (
        !embedded && (
          <Link
            className="text-link studio-debug-link"
            href="/practice/diagnostics"
          >
            {w(
              t(
                'Диагностика камеры и модели',
                'Камера мен модель диагностикасы',
              ),
            )}{' '}
            →
          </Link>
        )
      )}
    </div>
  );
}

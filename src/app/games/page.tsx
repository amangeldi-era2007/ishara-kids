'use client';
import { useState } from 'react';
import { SectionIntro, useProgress, useWords } from '@/components/app-shell';
import { HintImageCard, VideoLessonCard } from '@/components/sign-card';
import { signById } from '@/data/atlas';
import { completeGame } from '@/lib/progress';
import { t } from '@/lib/content';

const modes = [
  {
    id: 'garden',
    name: t('Угадай слово', 'Сөзді тап'),
    hint: t(
      'Посмотри на картинку и выбери слово.',
      'Суретке қарап, сөзді таңда.',
    ),
  },
  {
    id: 'pairs',
    name: t('Найди картинку', 'Суретті тап'),
    hint: t(
      'Прочитай подсказку и найди картинку.',
      'Көмекші мәтінді оқып, суретті тап.',
    ),
  },
] as const;
const rounds = [
  ['book', 'water', 'joy'],
  ['water', 'tree', 'circle'],
  ['joy', 'sun', 'book'],
];
export default function Games() {
  const w = useWords();
  const { progress, update } = useProgress();
  const [active, setActive] = useState<number | null>(null),
    [round, setRound] = useState(0),
    [answer, setAnswer] = useState('');
  const target = signById(rounds[round][0]),
    correct = answer === target.id,
    last = round === rounds.length - 1;
  const options = [
    ...rounds[round].slice((round + 1) % 3),
    ...rounds[round].slice(0, (round + 1) % 3),
  ].map(signById);
  function start(mode: number | null) {
    setActive(mode);
    setRound(0);
    setAnswer('');
  }
  function pick(id: string) {
    if (correct || active === null) return;
    setAnswer(id);
    if (last && id === target.id)
      update((p) => completeGame(p, modes[active].id));
  }
  return (
    <div className="container">
      <SectionIntro
        eyebrow={t('Игровая поляна', 'Ойын алаңы')}
        title={t('Играем с картинками', 'Суреттермен ойнаймыз')}
        description={t(
          'Три загадки в каждой игре. Можно пробовать снова.',
          'Әр ойында үш жұмбақ бар. Қайта байқап көруге болады.',
        )}
      />
      {active === null ? (
        <div className="grid two">
          {modes.map((m, i) => (
            <article className="card" key={m.id}>
              <span className="atlas-kicker">
                0{i + 1} / {w(t('Игра', 'Ойын'))}
              </span>
              <h2>{w(m.name)}</h2>
              <p>{w(m.hint)}</p>
              <p>
                {progress.games[m.id]
                  ? w(t('Награда получена ✓', 'Марапат алынды ✓'))
                  : '★ 10'}
              </p>
              <button className="btn btn-primary" onClick={() => start(i)}>
                {w(t('Играть', 'Ойнау'))}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <section className="card game-board">
          <button className="text-link" onClick={() => start(null)}>
            ← {w(t('Все игры', 'Барлық ойындар'))}
          </button>
          <h2>{w(modes[active].name)}</h2>
          <p>
            {round + 1} / 3 ·{' '}
            {w(t('Игра на понимание смысла', 'Мағынаны түсіну ойыны'))}
          </p>
          {active === 0 ? (
            <HintImageCard entry={target} />
          ) : target.verification_status === 'verified' ? (
            <VideoLessonCard entry={target} />
          ) : (
            <p className="demo-note">
              {w(
                t(
                  'Демо: подсказка вместо жеста.',
                  'Демо: ымның орнына көмекші мәтін.',
                ),
              )}{' '}
              {w(t(target.description_ru, target.description_kz))}
            </p>
          )}
          <div className="option-list">
            {options.map((o) => (
              <button
                key={o.id}
                disabled={correct}
                className={
                  'option' +
                  (answer === o.id ? (correct ? ' chosen' : ' wrong') : '')
                }
                onClick={() => pick(o.id)}
                aria-label={w(t(o.title_ru, o.title_kz))}
              >
                {active === 1 ? (
                  <span className="option-icon">{o.icon}</span>
                ) : (
                  w(t(o.title_ru, o.title_kz))
                )}
              </button>
            ))}
          </div>
          {answer && (
            <p role="status" className={'feedback' + (correct ? '' : ' try')}>
              {correct
                ? last
                  ? w(
                      t(
                        'Игра пройдена! Награда сохранена.',
                        'Ойын аяқталды! Марапат сақталды.',
                      ),
                    )
                  : w(t('Верно!', 'Дұрыс!'))
                : w(t('Попробуй ещё.', 'Қайта байқап көр.'))}
            </p>
          )}
          {correct && (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (last) start(null);
                else {
                  setRound(round + 1);
                  setAnswer('');
                }
              }}
            >
              {last
                ? w(t('К играм', 'Ойындарға'))
                : w(t('Дальше', 'Әрі қарай'))}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

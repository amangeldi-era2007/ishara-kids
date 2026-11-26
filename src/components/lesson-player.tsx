'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Star } from 'lucide-react';
import { Mascot, useProgress, useWords } from './app-shell';
import {
  HintImageCard,
  SignIllustration,
  VerificationBadge,
  VideoLessonCard,
} from './sign-card';
import { canPractice } from '@/data/practice';
import { PracticeStudio } from './practice-studio';
import { t, type Lesson } from '@/lib/content';
import { completeLesson, isUnlocked } from '@/lib/progress';

function DemoNote() {
  const w = useWords();
  return (
    <p className="demo-note">
      {w(
        t(
          'Игры проверяют знание слов и картинок. Движения не оцениваются.',
          'Ойындар сөздер мен суреттерді тануға арналған. Қимыл бағаланбайды.',
        ),
      )}
    </p>
  );
}
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const w = useWords();
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={w(t('Ход урока', 'Сабақ барысы'))}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className="progress-fill"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}
export function RewardAnimation({ points }: { points: number }) {
  const w = useWords();
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.35 }}
      className="reward-splash"
    >
      <span className="reward-emoji" aria-hidden="true">
        🌟
      </span>
      <h2>{w(t('Здорово получилось!', 'Керемет орындадың!'))}</h2>
      <p>
        {w(
          t(
            'Ты нашёл ответы и собрал пары. Вот твои звёзды за урок.',
            'Сен жауаптар мен жұптарды таптың. Міне, сабақта жинаған жұлдыздарың.',
          ),
        )}
      </p>
      <strong>{points} ⭐</strong>
    </motion.div>
  );
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const w = useWords();
  const { progress, update } = useProgress();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState<Record<number, boolean>>({});
  const [source, setSource] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'wrong' | 'right' | null>(null);
  const end = lesson.questions.length + 3; // video, questions, matching, self practice, completion
  const matchingStep = lesson.questions.length + 1;
  const practiceStep = matchingStep + 1;
  const question =
    step > 0 && step <= lesson.questions.length
      ? lesson.questions[step - 1]
      : null;
  const unlocked = isUnlocked(lesson.id, progress.completed);
  if (!unlocked)
    return (
      <div className="container section">
        <h1>
          {w(
            t(
              'Сначала пройди предыдущий урок',
              'Алдымен алдыңғы сабақты аяқта',
            ),
          )}
        </h1>
        <Link className="btn btn-primary" href="/learn">
          {w(t('К карте', 'Картаға'))}
        </Link>
      </div>
    );
  function forward() {
    if (step === practiceStep) {
      update((p) =>
        completeLesson(
          p,
          lesson.id,
          Object.values(correct).filter(Boolean).length,
        ),
      );
    }
    setFeedback(null);
    setAnswer(null);
    setSource(null);
    setStep((s) => Math.min(s + 1, end));
  }
  function choose(id: string) {
    if (!question || answer === question.answer) return;
    setAnswer(id);
    if (id === question.answer) {
      setCorrect((c) => ({ ...c, [step]: true }));
      setFeedback('right');
    } else setFeedback('wrong');
  }
  function pair(id: string) {
    if (!source || matched.includes(id)) return;
    if (source === id) {
      setMatched((m) => [...m, id]);
      setFeedback('right');
    } else setFeedback('wrong');
    setSource(null);
  }
  const canContinue =
    step === 0 ||
    step === practiceStep ||
    (question && answer === question.answer) ||
    (step === matchingStep && matched.length === lesson.match.pairs.length);
  return (
    <div className="container">
      <div className="section-intro">
        <Link className="text-link" href="/learn">
          ← {w(t('К карте', 'Картаға'))}
        </Link>
        <span className="eyebrow" style={{ display: 'table', marginTop: 22 }}>
          {w(t('Демо-урок', 'Демо-сабақ'))} · {lesson.icon}
        </span>
        <h1>{w(lesson.title)}</h1>
        <p>{w(lesson.description)}</p>
      </div>
      <DemoNote />
      <div className="lesson-layout">
        <div className="lesson-main">
          <ProgressBar value={step} max={end} />
          <div
            className="step-pills"
            aria-label={w(t('Этапы урока', 'Сабақ кезеңдері'))}
          >
            {[
              t('Введение', 'Кіріспе'),
              t('Вопросы', 'Сұрақтар'),
              t('Пары', 'Жұптар'),
              t('Практика', 'Жаттығу'),
            ].map((label, i) => (
              <span
                key={i}
                className={
                  (i === 0 && step === 0) ||
                  (i === 1 && !!question) ||
                  (i === 2 && step === matchingStep) ||
                  (i === 3 && step >= practiceStep)
                    ? 'current'
                    : ''
                }
              >
                {w(label)}
              </span>
            ))}
          </div>
          <div className="card" key={step}>
            {step === 0 && (
              <>
                <VerificationBadge entry={lesson.material} />
                <h2>
                  {w(t(lesson.material.title_ru, lesson.material.title_kz))}
                </h2>
                <HintImageCard entry={lesson.material} />
                <p>
                  {w(
                    t(
                      lesson.material.description_ru,
                      lesson.material.description_kz,
                    ),
                  )}
                </p>
                <SignIllustration entry={lesson.material} />
                <VideoLessonCard entry={lesson.material} />
              </>
            )}
            {question && (
              <>
                <span className="eyebrow">
                  {w(t('Вопрос', 'Сұрақ'))} {step}/{lesson.questions.length}
                </span>
                <h2 style={{ marginTop: 17 }}>{w(question.prompt)}</h2>
                <div className="option-list">
                  {question.options.map((opt) => (
                    <button
                      className={`option${answer === opt.id ? (answer === question.answer ? ' chosen' : ' wrong') : ''}`}
                      type="button"
                      key={opt.id}
                      onClick={() => choose(opt.id)}
                      aria-pressed={answer === opt.id}
                    >
                      <span className="option-icon" aria-hidden="true">
                        {opt.icon}
                      </span>
                      {w(opt.label)}
                    </button>
                  ))}
                </div>
                {feedback && (
                  <div
                    className={`feedback${feedback === 'wrong' ? ' try' : ''}`}
                    role="status"
                  >
                    {feedback === 'right'
                      ? w(t('Верно! Отличная работа ✨', 'Дұрыс! Жарайсың ✨'))
                      : w(
                          t(
                            'Попробуй другой ответ — всё получится!',
                            'Басқа жауапты байқап көр — қолыңнан келеді!',
                          ),
                        )}
                  </div>
                )}
              </>
            )}
            {step === matchingStep && (
              <>
                <span className="eyebrow">
                  {w(t('Игра с парами', 'Жұп ойыны'))}
                </span>
                <h2 style={{ marginTop: 17 }}>{w(lesson.match.prompt)}</h2>
                <p>
                  {w(
                    t(
                      'Сначала выбери картинку слева, потом её название справа.',
                      'Алдымен сол жақтағы суретті, содан кейін оң жақтағы атауын таңда.',
                    ),
                  )}
                </p>
                <div className="pair-grid">
                  <div className="option-list">
                    {lesson.match.pairs.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`option${source === item.id ? ' chosen' : ''}`}
                        disabled={matched.includes(item.id)}
                        aria-pressed={source === item.id}
                        onClick={() => {
                          setSource(item.id);
                          setFeedback(null);
                        }}
                      >
                        <span className="option-icon">{item.icon}</span>
                        {matched.includes(item.id)
                          ? '✓'
                          : w(t('Выбрать', 'Таңдау'))}
                      </button>
                    ))}
                  </div>
                  <div className="option-list">
                    {[...lesson.match.pairs].reverse().map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="option"
                        disabled={matched.includes(item.id) || !source}
                        onClick={() => pair(item.id)}
                      >
                        {w(item.label)} {matched.includes(item.id) ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="feedback" role="status">
                  {feedback === 'wrong'
                    ? w(
                        t(
                          'Пока не совпало. Попробуй ещё!',
                          'Сәйкес келмеді. Қайта байқап көр!',
                        ),
                      )
                    : `${matched.length} / ${lesson.match.pairs.length} ${w(t('пар найдено', 'жұп табылды'))}`}
                </div>
              </>
            )}
            {step === practiceStep && (
              <>
                <h2>{w(t('Твоя минутка практики', 'Өзің жаттығып көр'))}</h2>
                <p>
                  {w(
                    t(
                      'Вспомни картинки и слова из игры. Можешь рассказать взрослому, что тебе запомнилось. Это самостоятельная практика, не проверка исполнения жеста.',
                      'Ойындағы суреттер мен сөздерді есіңе түсір. Нені есте сақтағаныңды ересек адамға айта аласың. Бұл өз бетіңше жаттығу, ымды бағалау емес.',
                    ),
                  )}
                </p>
                <div className="video-placeholder">
                  🌱{' '}
                  {w(
                    t(
                      'Самостоятельное повторение без оценки',
                      'Өз бетінше қайталау, бағалаусыз',
                    ),
                  )}
                </div>
                {canPractice(lesson.material.id) && (
                  <PracticeStudio embedded initialSign={lesson.material.id} />
                )}
              </>
            )}
            {step === end && (
              <>
                <RewardAnimation points={progress.completed[lesson.id] ?? 0} />
                <div className="lesson-controls">
                  <Link className="btn btn-light" href="/learn">
                    {w(t('К карте', 'Картаға'))}
                  </Link>
                  <Link className="btn btn-primary" href="/rewards">
                    {w(t('Мои награды', 'Менің марапаттарым'))}{' '}
                    <Star size={17} />
                  </Link>
                </div>
              </>
            )}
            {step < end && (
              <div className="lesson-controls">
                <button
                  className="btn btn-light"
                  type="button"
                  disabled={step === 0}
                  onClick={() => {
                    setStep((s) => s - 1);
                    setAnswer(null);
                    setFeedback(null);
                  }}
                >
                  <ArrowLeft size={18} />
                  {w(t('Назад', 'Артқа'))}
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={!canContinue}
                  onClick={forward}
                >
                  {step === practiceStep
                    ? w(t('Завершить урок', 'Сабақты аяқтау'))
                    : w(t('Дальше', 'Әрі қарай'))}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
        <aside className="card" style={{ textAlign: 'center' }}>
          <Mascot small />
          <h3>{w(t('Я рядом!', 'Мен осындамын!'))}</h3>
          <p>
            {w(
              t(
                'Не торопись. Пробуй сколько захочешь!',
                'Асықпа. Қалағаныңша байқап көр!',
              ),
            )}
          </p>
          <button
            className="btn btn-light"
            type="button"
            onClick={() => {
              setStep(0);
              setAnswer(null);
              setFeedback(null);
              setMatched([]);
              setCorrect({});
            }}
          >
            <RotateCcw size={16} />
            {w(t('Начать заново', 'Қайта бастау'))}
          </button>
          {step === end && (
            <p>
              <Check size={17} /> {w(t('Урок завершён', 'Сабақ аяқталды'))}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

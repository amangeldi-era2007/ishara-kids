'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Film, BadgeCheck, ExternalLink } from 'lucide-react';
import {
  categoryFor,
  mediaUrl,
  officialSources,
  type SignEntry,
} from '@/data/atlas';
import { useProgress, useWords } from './app-shell';
import { t } from '@/lib/content';
import Link from 'next/link';
import { canPractice } from '@/data/practice';

const labels = {
  verified: t('Проверенный источник', 'Тексерілген дереккөз'),
  pending: t('Ожидает проверки', 'Тексеруді күтуде'),
  demo: t('Демо-карточка', 'Демо-карточка'),
};
export function VerificationBadge({ entry }: { entry: SignEntry }) {
  const w = useWords();
  return (
    <span
      className={`status ${entry.verification_status === 'verified' ? '' : 'demo'}`}
    >
      {entry.verification_status === 'verified' && <BadgeCheck size={16} />}{' '}
      {w(labels[entry.verification_status])}
    </span>
  );
}
export function HintImageCard({ entry }: { entry: SignEntry }) {
  const [broken, setBroken] = useState(false);
  const w = useWords();
  const category = categoryFor(entry);
  return (
    <figure className="hint-picture" style={{ backgroundColor: category.tint }}>
      {entry.image_hint && !broken ? (
        <Image
          unoptimized
          width={180}
          height={110}
          src={mediaUrl(entry.image_hint)}
          alt={w(t(entry.title_ru, entry.title_kz))}
          onError={() => setBroken(true)}
        />
      ) : (
        <span role="img" aria-label={w(t(entry.title_ru, entry.title_kz))}>
          {entry.icon}
        </span>
      )}
      <figcaption>{w(t(category.ru, category.kk))}</figcaption>
    </figure>
  );
}
export function SignIllustration({ entry }: { entry: SignEntry }) {
  const w = useWords();
  if (
    !entry.sign_image ||
    (entry.verification_status !== 'verified' &&
      entry.reference_kind !== 'research')
  )
    return null;
  const url = mediaUrl(entry.sign_image);
  const title = w(t(entry.title_ru, entry.title_kz));
  return (
    <figure className="sign-reference">
      <a
        className="sign-photo-link"
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label={`${w(t('Увеличить фото дактиля', 'Дактиль суретін үлкейту'))}: ${title}`}
      >
        <Image
          unoptimized
          width={320}
          height={240}
          src={url}
          alt={`${w(t('Фото дактиля', 'Дактиль суреті'))}: ${title}`}
        />
      </a>
      <figcaption>
        {w(
          entry.reference_kind === 'research'
            ? t('Фото из исследования', 'Зерттеудегі фото')
            : t('Фото исполнения', 'Орындалу суреті'),
        )}{' '}
        ·{' '}
        <a className="text-link" href={entry.source_url!}>
          {entry.source_name}
        </a>{' '}
        · {entry.license}
      </figcaption>
    </figure>
  );
}
export function VideoLessonCard({ entry }: { entry: SignEntry }) {
  const w = useWords();
  const [broken, setBroken] = useState(false);
  if (
    entry.verification_status === 'verified' &&
    entry.video_url &&
    entry.captions &&
    !broken
  )
    return (
      <figure>
        <video
          controls
          playsInline
          preload="metadata"
          poster={entry.thumbnail ? mediaUrl(entry.thumbnail) : undefined}
          src={mediaUrl(entry.video_url)}
          onError={() => setBroken(true)}
          aria-label={w(t(entry.title_ru, entry.title_kz))}
        >
          <track
            kind="captions"
            default
            src={mediaUrl(entry.captions)}
            srcLang={entry.caption_language || 'ru'}
          />
        </video>
        <figcaption>
          <a className="text-link" href={entry.source_url!}>
            {entry.source_name}
          </a>{' '}
          · {entry.license}
        </figcaption>
      </figure>
    );
  if (entry.surdo_video_id)
    return (
      <a
        className="btn btn-light sign-video-link"
        href={`https://www.youtube.com/watch?v=${entry.surdo_video_id}`}
        target="_blank"
        rel="noreferrer"
      >
        <span>
          {w(t('Видео на YouTube', 'YouTube бейнесі'))} ·{' '}
          {w(t(entry.title_ru, entry.title_kz))}
          <small className="sign-video-credit">surdo server</small>
        </span>
        <ExternalLink aria-hidden="true" size={16} />
      </a>
    );
  if (entry.alphabet_pdf_page)
    return (
      <a
        className="btn btn-light sign-video-link"
        href={`${officialSources.alphabetPdf}#page=${entry.alphabet_pdf_page}`}
        target="_blank"
        rel="noreferrer"
      >
        {w(t('Описание в таблице (PDF)', 'Кестедегі сипаттама (PDF)'))}
        <ExternalLink aria-hidden="true" size={16} />
      </a>
    );
  if (
    entry.sign_image &&
    (entry.verification_status === 'verified' ||
      entry.reference_kind === 'research') &&
    !broken
  )
    return null;
  return (
    <div className="film-slot">
      <Film size={21} aria-hidden="true" />
      <span>
        {broken
          ? w(
              t(
                'Видео недоступно. Можно продолжить с картинкой.',
                'Бейне ашылмады. Суретпен жалғастыра аласың.',
              ),
            )
          : w(
              t(
                'Здесь появится официальное видео',
                'Ресми бейне осында шығады',
              ),
            )}
      </span>
    </div>
  );
}
export function DictionaryCard({ entry }: { entry: SignEntry }) {
  const w = useWords();
  const { progress } = useProgress();
  return (
    <article
      className="card atlas-entry"
      id={`entry-${entry.id}`}
      tabIndex={-1}
    >
      <HintImageCard entry={entry} />
      <VerificationBadge entry={entry} />
      <h3>{w(t(entry.title_ru, entry.title_kz))}</h3>
      {entry.title_ru !== entry.title_kz && (
        <small lang={progress.locale === 'ru' ? 'kk' : 'ru'}>
          {progress.locale === 'ru' ? entry.title_kz : entry.title_ru}
        </small>
      )}
      <p>{w(t(entry.description_ru, entry.description_kz))}</p>
      <SignIllustration entry={entry} />
      <VideoLessonCard entry={entry} />
      <p className="ai-tag">
        {canPractice(entry.id) ? (
          <Link className="text-link" href={`/practice?sign=${entry.id}`}>
            {w(t('Повторить с AI', 'AI арқылы қайталау'))} →
          </Link>
        ) : (
          w(t('AI-проверка пока недоступна', 'AI тексеруі әзірге қолжетімсіз'))
        )}
      </p>
    </article>
  );
}

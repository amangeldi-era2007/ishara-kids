'use client';

import { useState } from 'react';
import { useProgress, useWords } from './app-shell';
import { lessons, t, type Text } from '@/lib/content';
import { progressSchema } from '@/lib/progress';

const savedProgress = progressSchema.pick({ completed: true, games: true });
const keyPattern = /^[a-f0-9]{64}$/;
const devApi = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8787' : '';

function apiEndpoint() {
  const configured = process.env.NEXT_PUBLIC_PROGRESS_API || devApi;
  if (!configured) return '';
  try {
    const url = new URL(configured);
    const local = ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.username || url.password || (url.protocol !== 'https:' && !(local && url.protocol === 'http:'))) return '';
    return `${url.origin}/api/progress`;
  } catch {
    return '';
  }
}

const endpoint = apiEndpoint();

export function ProgressBackup() {
  const w = useWords();
  const { progress, ready, update } = useProgress();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Text | null>(null);
  const cleanCode = code.trim().toLowerCase();
  const valid = keyPattern.test(cleanCode);

  async function transfer(method: 'PUT' | 'GET' | 'DELETE') {
    if (busy || !ready || !endpoint) return;
    let key = cleanCode;
    if (method === 'PUT' && !key) {
      key = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
      setCode(key);
    }
    if (!keyPattern.test(key)) return;
    setBusy(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
      if (method === 'PUT') headers['Content-Type'] = 'application/json';
      const response = await fetch(endpoint, {
        method, headers, credentials: 'omit', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000),
        body: method === 'PUT' ? JSON.stringify(savedProgress.parse(progress)) : undefined,
      });
      if (response.status === 404 && method === 'GET') {
        setMessage(t('Копия с таким кодом не найдена.', 'Бұл кодпен сақтық көшірме табылмады.'));
        return;
      }
      if (!response.ok) throw new Error('Backup request failed');
      if (method === 'GET') {
        const backup = savedProgress.parse(await response.json());
        update(current => {
          const completed = { ...current.completed };
          for (const lesson of lessons) {
            const points = backup.completed[lesson.id];
            if ([30, 40, 50].includes(points)) completed[lesson.id] = Math.max(completed[lesson.id] ?? 0, points);
          }
          const games = { ...current.games };
          for (const [game, won] of Object.entries(backup.games)) {
            if (won && /^(garden|pairs|practice:[a-z][a-z0-9-]{0,54})$/.test(game)) games[game] = true;
          }
          return { ...current, completed, games };
        });
        setMessage(t('Уроки, игры и звёзды восстановлены.', 'Сабақтар, ойындар мен жұлдыздар қалпына келтірілді.'));
      } else {
        setMessage(method === 'PUT'
          ? t('Копия сохранена. Сохрани секретный код: он понадобится на другом устройстве.', 'Көшірме сақталды. Құпия кодты сақтап қой: ол басқа құрылғыда керек болады.')
          : t('Резервная копия удалена. Прогресс на устройстве остался.', 'Сақтық көшірме жойылды. Құрылғыдағы үлгерім сақталды.'));
      }
    } catch {
      setMessage(t('Не удалось связаться с сервером или сохранить данные. Попробуй ещё раз.', 'Серверге қосылу немесе сақтау сәтсіз аяқталды. Қайталап көр.'));
    } finally {
      setBusy(false);
    }
  }

  return <section className="card studio-diagnostics">
    <h2>{w(t('Резервная копия прогресса', 'Үлгерімнің сақтық көшірмесі'))}</h2>
    {endpoint ? <>
      <p>{w(t('По твоему нажатию сервер сохраняет пройденные уроки и игры. Псевдоним и данные камеры остаются на устройстве.', 'Батырманы бассаң, сервер өткен сабақтар мен ойындарды сақтайды. Лақап ат пен камера деректері құрылғыда қалады.'))}</p>
      <label className="field" htmlFor="backup-code">{w(t('Секретный код', 'Құпия код'))}</label>
      <input className="input" id="backup-code" value={code} onChange={event => setCode(event.target.value)}
        maxLength={64} autoComplete="off" spellCheck={false} disabled={busy} />
      <p>{w(t('Для первой копии оставь поле пустым. Храни код у себя: он открывает доступ к копии.', 'Алғашқы көшірме үшін өрісті бос қалдыр. Кодты өзіңде сақта: ол көшірмеге қол жеткізуге мүмкіндік береді.'))}</p>
      <div className="hero-buttons">
        <button className="btn btn-primary" disabled={!ready || busy || (!!cleanCode && !valid)} onClick={() => void transfer('PUT')}>{w(t('Сохранить копию', 'Көшірмені сақтау'))}</button>
        <button className="btn btn-light" disabled={!ready || busy || !valid} onClick={() => void transfer('GET')}>{w(t('Восстановить', 'Қалпына келтіру'))}</button>
        <button className="btn btn-light" disabled={!ready || busy || !valid} onClick={() => {
          if (window.confirm(w(t('Удалить резервную копию с сервера?', 'Сақтық көшірмені серверден жою керек пе?')))) void transfer('DELETE');
        }}>{w(t('Удалить копию', 'Көшірмені жою'))}</button>
      </div>
      <p className="mt-3" role="status">{busy ? w(t('Подожди…', 'Күте тұр…')) : message ? w(message) : ''}</p>
    </> : <p>{w(t('Сервер копий не подключён. Прогресс сохраняется в этом браузере.', 'Сақтық көшірме сервері қосылмаған. Үлгерім осы браузерде сақталады.'))}</p>}
  </section>;
}

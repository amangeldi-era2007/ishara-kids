'use client';
import { Mascot, useWords } from './app-shell';
import { t } from '@/lib/content';

export function AtlasCover() {
  const w = useWords();
  return (
    <figure className="atlas-cover">
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="600" height="400" fill="#d8ebed" />
        <circle cx="443" cy="92" r="48" fill="#ffcc65" />
        <g fill="#fcf8e8">
          <path d="M40 99q8-20 26-16 10-39 40-27 14 4 20 22 29-4 37 21z" />
          <path d="M325 62q8-17 20-13 9-27 29-18 12 2 16 17 19-2 25 14z" />
        </g>
        <path
          d="m0 257 120-102 44 30 111-123 122 141 42-36 161 84v149H0"
          fill="#819ca1"
        />
        <path
          d="m211 133 64-71 58 67-33-12-15 8-18-20-16 19-16-4z"
          fill="#fff9e7"
        />
        <path d="M0 225q132-71 268-16t332-29v220H0" fill="#9dcbb4" />
        <path d="M0 259q135 37 289-8t311-9v158H0" fill="#5a9b82" />
        <path d="M0 309q132-44 259 7t341-8v92H0" fill="#327565" />
        <path
          d="M490 406q-167-62-70-101t26-60q-19-8-45-9 60-1 85 14 47 25-25 58t91 98"
          fill="#f2d49a"
        />
        <g fill="#ffda81">
          <circle cx="50" cy="318" r="4" />
          <circle cx="62" cy="313" r="3" />
          <circle cx="518" cy="296" r="4" />
          <circle cx="544" cy="286" r="3" />
        </g>
      </svg>
      <div className="atlas-guide">
        <Mascot />
      </div>
      <figcaption>
        01 / 05 <span>·</span> {w(t('В путь с Мими', 'Мимимен саяхат'))}
      </figcaption>
    </figure>
  );
}

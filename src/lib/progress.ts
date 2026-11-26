import { z } from 'zod';
import { lessons, type Locale } from './content';

export const progressSchema = z.object({
  version: z.literal(1), nickname: z.string().max(24), avatar: z.enum(['star', 'fox', 'flower']), locale: z.enum(['ru', 'kk']),
  completed: z.record(z.string(), z.number().int().min(0)), games: z.record(z.string(), z.boolean()),
});
export type Progress = z.infer<typeof progressSchema>;
export const initialProgress: Progress = { version: 1, nickname: '', avatar: 'star', locale: 'ru', completed: {}, games: {} };
export interface ProgressRepository { load(): Progress; save(value: Progress): void; clear(): void }
export const STORAGE_KEY = 'ishara-kids:progress:v1';
export const browserRepository: ProgressRepository = {
  load() { try { const stored = localStorage.getItem(STORAGE_KEY); return stored ? progressSchema.parse(JSON.parse(stored)) : initialProgress; } catch { return initialProgress; } },
  save(value) { localStorage.setItem(STORAGE_KEY, JSON.stringify(progressSchema.parse(value))); },
  clear() { localStorage.removeItem(STORAGE_KEY); },
};
export function isUnlocked(id: string, completed: Progress['completed']): boolean {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  return index >= 0 && (index === 0 || completed[lessons[index - 1].id] !== undefined);
}
export function completeLesson(progress: Progress, id: string, correct: number): Progress {
  if (!isUnlocked(id, progress.completed) || progress.completed[id] !== undefined) return progress;
  return { ...progress, completed: { ...progress.completed, [id]: 30 + Math.max(0, Math.min(correct, 2)) * 10 } };
}
export function completeGame(progress: Progress, id: string): Progress {
  if (progress.games[id]) return progress;
  return { ...progress, games: { ...progress.games, [id]: true } };
}
export const totalStars = (progress: Progress) => Object.values(progress.completed).reduce((sum, points) => sum + points, 0) + Object.values(progress.games).filter(Boolean).length * 10;
export const achievementSchema = z.object({id:z.enum(['first','unit','explorer','play']),unlocked:z.boolean()});
export type Achievement = z.infer<typeof achievementSchema>;
export const badges = (progress: Progress):Achievement[] => [
  { id: 'first', unlocked: Object.keys(progress.completed).length >= 1 },
  { id: 'unit', unlocked: lessons.filter((l) => l.unit === 1).every((l) => progress.completed[l.id] !== undefined) },
  { id: 'explorer', unlocked: lessons.every((l) => progress.completed[l.id] !== undefined) },
  { id: 'play', unlocked: Boolean(progress.games.garden && progress.games.pairs) },
];
export function getLocale(progress: Progress): Locale { return progress.locale; }

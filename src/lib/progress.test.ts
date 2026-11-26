import { describe, expect, it } from 'vitest';
import {
  initialProgress,
  isUnlocked,
  completeLesson,
  completeGame,
  badges,
  totalStars,
  progressSchema,
} from './progress';
import { lessons } from './content';
import { signSchema, signById } from '../data/atlas';
describe('local deterministic progress', () => {
  it('links each lesson to an existing material and preserves distinct route IDs', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toEqual(lessons.length);
    for (const l of lessons)
      expect(signById(l.material.id).category).toBe(l.category);
    expect(progressSchema.parse(initialProgress)).toEqual(initialProgress);
  });
  it('blocks declarations of verified content without local media, review or permission', () => {
    const approved = {
      ...signById('book'),
      verification_status: 'verified',
      reviewed_by: 'Test reviewer',
      license: 'Fixture permission',
      source_name: 'Fixture',
      source_url: 'https://example.org/item',
      video_url: '/content/videos/test.mp4',
      captions: '/content/videos/test.vtt',
    };
    expect(signSchema.safeParse(approved).success).toBe(true);
    for (const key of [
      'reviewed_by',
      'license',
      'source_name',
      'source_url',
      'video_url',
      'captions',
    ])
      expect(signSchema.safeParse({ ...approved, [key]: null }).success).toBe(
        false,
      );
    expect(
      signSchema.safeParse({
        ...approved,
        video_url: '/content/videos/../draft.mp4',
      }).success,
    ).toBe(false);
  });
  it('unlocks in order and awards a lesson once', () => {
    expect(isUnlocked('colors', {})).toBe(true);
    expect(isUnlocked('shapes', {})).toBe(false);
    const one = completeLesson(initialProgress, 'colors', 2);
    expect(one.completed.colors).toBe(50);
    expect(isUnlocked('shapes', one.completed)).toBe(true);
    expect(completeLesson(one, 'colors', 1)).toEqual(one);
    expect(completeLesson(initialProgress, 'shapes', 2)).toEqual(
      initialProgress,
    );
  });
  it('awards games once and badges by achievements', () => {
    const first = completeGame(initialProgress, 'garden');
    expect(totalStars(first)).toBe(10);
    expect(totalStars(completeGame(first, 'garden'))).toBe(10);
    expect(badges(first).find((b) => b.id === 'play')?.unlocked).toBe(false);
    expect(
      badges(completeGame(first, 'pairs')).find((b) => b.id === 'play')
        ?.unlocked,
    ).toBe(true);
  });
});

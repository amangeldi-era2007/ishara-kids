import { describe, expect, it } from 'vitest';
import { initialProgress, isUnlocked, completeLesson, completeGame, badges, totalStars, progressSchema } from './progress';
import { lessons, lessonSchema } from './content';
describe('local deterministic progress',()=>{
 it('validates typed demo lessons and empty progress',()=>{ expect(lessons).toHaveLength(3);expect(progressSchema.parse(initialProgress)).toEqual(initialProgress); });
 it('rejects a verified lesson without a licensed captioned video',()=>{expect(lessonSchema.safeParse({...lessons[0],approval:'verified'}).success).toBe(false);});
 it('unlocks in order and awards a lesson once',()=>{ expect(isUnlocked('colors',{})).toBe(true);expect(isUnlocked('shapes',{})).toBe(false);const one=completeLesson(initialProgress,'colors',2);expect(one.completed.colors).toBe(50);expect(isUnlocked('shapes',one.completed)).toBe(true);expect(completeLesson(one,'colors',1)).toEqual(one);expect(completeLesson(initialProgress,'shapes',2)).toEqual(initialProgress); });
 it('awards games once and badges by achievements',()=>{const first=completeGame(initialProgress,'garden');expect(totalStars(first)).toBe(10);expect(totalStars(completeGame(first,'garden'))).toBe(10);expect(badges(first).find((b)=>b.id==='play')?.unlocked).toBe(false);expect(badges(completeGame(first,'pairs')).find((b)=>b.id==='play')?.unlocked).toBe(true);});
});

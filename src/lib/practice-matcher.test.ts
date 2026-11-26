import { describe, expect, it } from 'vitest';
import { advanceStreak, createMatcher, normalize, type HandFrame, type Point } from './practice-matcher';

// Geometry fixtures only. These shapes do not represent signs or calibrate the production classifier.
function shape(bend: number): Point[] {
  return Array.from({ length: 21 }, (_, i) => ({ x: i === 9 ? 1 : 0, y: i > 9 ? bend : 0, z: 0 }));
}
const frame = (points: Point[], handedness = 'Right'): HandFrame => ({ hands: [{ points, handedness }], count: 1, tooFar: false });
const classify = createMatcher({ validation: 'Synthetic fixtures only', classes: [0, 1].map((value, i) => ({
  id: String(i),
  samples: [0, 0.01, 0.02].map(delta => ({ points: shape(value + delta), handedness: 'Right' })),
  maxDistance: 0.015, minMargin: 0.08,
})) });

describe('static pose comparison', () => {
  it('removes translation and scale without discarding orientation', () => {
    const points = shape(1);
    expect(normalize(points.map(p => ({ x: p.x * 4 + 2, y: p.y * 4 - 7, z: 3 })))).toEqual(normalize(points));
    expect(normalize(shape(0).map(p => ({ ...p, x: -p.x })))).not.toEqual(normalize(shape(0)));
    expect(normalize(Array(21).fill({ x: 0, y: 0, z: 0 }))).toBeNull();
  });
  it('distinguishes alternatives and rejects ambiguous or unseen poses', () => {
    expect(classify(frame(shape(0)))).toMatchObject({ id: '0', confident: true });
    expect(classify(frame(shape(1)))).toMatchObject({ id: '1', confident: true });
    expect(classify(frame(shape(0.5)))?.confident).toBe(false);
    expect(classify(frame(shape(3)))?.confident).toBe(false);
    expect(classify(frame(shape(1), 'Left'))).toBeNull();
    expect(classify({ hands: [], count: 0, tooFar: false })).toBeNull();
    expect(classify({ ...frame(shape(1)), count: 2 })).toBeNull();
    expect(classify({ ...frame(shape(1)), tooFar: true })).toBeNull();
  });
  it('resets consecutive evidence after a missing or different prediction', () => {
    const two = advanceStreak(advanceStreak(null, 'a'), 'a');
    expect(two?.frames).toBe(2);
    expect(advanceStreak(two, 'b')).toEqual({ id: 'b', frames: 1 });
    expect(advanceStreak(two, null)).toBeNull();
  });
});

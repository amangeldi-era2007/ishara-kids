import { z } from 'zod';

const point = z.object({ x: z.number(), y: z.number(), z: z.number() });
const hand = z.object({ handedness: z.enum(['Left', 'Right']), points: point.array().length(21) });
export const templateSchema = z.object({
  classes: z.array(z.object({
    id: z.string().min(1),
    samples: hand.array().min(3),
    maxDistance: z.number().positive(),
    minMargin: z.number().positive(),
  })),
  validation: z.string().min(1),
}).refine(value => {
  const ids = value.classes.map(c => c.id);
  return new Set(ids).size === ids.length && (ids.length === 0 || ids.length >= 2);
}, 'Classification requires distinct competing classes');

export type Point = z.infer<typeof point>;
export type HandFrame = { hands: { points: Point[]; handedness: string }[]; count: number; tooFar: boolean };
export type Templates = z.infer<typeof templateSchema>;

export function normalize(points: Point[]) {
  if (points.length !== 21) return null;
  const wrist = points[0];
  const middle = points[9];
  const scale = Math.hypot(middle.x - wrist.x, middle.y - wrist.y, middle.z - wrist.z);
  if (!Number.isFinite(scale) || scale < 0.00001) return null;
  const result = points.flatMap(p => [(p.x - wrist.x) / scale, (p.y - wrist.y) / scale, (p.z - wrist.z) / scale]);
  return result.every(Number.isFinite) ? result : null;
}

export function createMatcher(templates: Templates) {
  const classes = templates.classes.map(c => ({
    ...c,
    samples: c.samples.flatMap(sample => {
      const normalized = normalize(sample.points);
      return normalized ? [{ side: sample.handedness, normalized }] : [];
    }),
  }));
  return (frame: HandFrame) => {
    if (frame.count !== 1 || frame.tooFar || frame.hands.length !== 1) return null;
    const { points, handedness } = frame.hands[0];
    const normalized = normalize(points);
    if (!normalized) return null;
    const scores = classes.flatMap(c => {
      const distances = c.samples.filter(s => s.side === handedness).map(sample =>
        sample.normalized.reduce((sum, n, i) => sum + (n - normalized[i]) ** 2, 0) / normalized.length,
      ).sort((a, b) => a - b);
      return distances.length >= 3 ? [{ ...c, distance: (distances[0] + distances[1] + distances[2]) / 3 }] : [];
    }).sort((a, b) => a.distance - b.distance);
    const [best, other] = scores;
    if (!best || !other) return null;
    const margin = other.distance - best.distance;
    return { id: best.id, distance: best.distance, margin, confident: best.distance <= best.maxDistance && margin >= best.minMargin };
  };
}

export function advanceStreak(previous: { id: string; frames: number } | null, id: string | null) {
  return id ? { id, frames: previous?.id === id ? previous.frames + 1 : 1 } : null;
}

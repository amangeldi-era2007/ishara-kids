import { templateSchema } from '@/lib/practice-matcher';
import { signs } from './atlas';
import raw from './practice-templates.json';

export const templates = templateSchema.parse(raw);
export const practiceSigns = signs.filter(sign =>
  sign.verification_status === 'verified' && templates.classes.some(c => c.id === sign.id),
);
export const canPractice = (id: string) => practiceSigns.some(sign => sign.id === id);

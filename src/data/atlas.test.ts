import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { signs } from './atlas';

it('ships every asset referenced by the local catalog', () => {
  for (const sign of signs) {
    for (const asset of [
      sign.video_url,
      sign.thumbnail,
      sign.image_hint,
      sign.sign_image,
      sign.captions,
    ]) {
      if (asset)
        expect(
          existsSync(join(process.cwd(), 'public', asset)),
          `${sign.id}: ${asset}`,
        ).toBe(true);
    }
  }
});

it('covers all 42 letters without substituting a photo or video for a different letter', () => {
  const alphabet = signs.filter((sign) => sign.category === 'alphabet');
  expect(alphabet.map((sign) => sign.title_kz).join('')).toBe(
    'АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ',
  );
  expect(
    alphabet.filter((sign) => !sign.sign_image).map((sign) => sign.title_kz),
  ).toEqual(['Ъ', 'Ь']);
  expect(
    alphabet
      .filter((sign) => !sign.surdo_video_id)
      .map((sign) => sign.title_kz),
  ).toEqual(['Ү']);
  expect(
    alphabet.find((sign) => sign.title_kz === 'Ү')?.alphabet_pdf_page,
  ).toBe(5);
  expect(
    new Set(alphabet.flatMap((sign) => sign.surdo_video_id ?? [])).size,
  ).toBe(41);
  expect(alphabet.every((sign) => sign.verification_status === 'pending')).toBe(
    true,
  );
});

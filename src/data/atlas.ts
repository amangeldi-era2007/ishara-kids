import { z } from 'zod';
import imported from './reviewed-entries.json';
import { dactylReferences } from './dactyl-references';

export const officialSources = {
  dictionary: 'https://special-edu.kz/news/6/single/1529',
  alphabet: 'https://special-edu.kz/news/575/single/1671',
  alphabetPdf:
    'https://special-edu.kz/beta/upload/files/%D0%94%D0%B0%D0%BA%D1%82%D0%B8%D0%BB%D1%8C%20%D1%80%D1%83%D1%81.pdf',
  ministry: 'https://www.gov.kz/org/edu/press/news/details/1239775?lang=ru',
  krsl: 'https://krslproject.github.io/krsl20/',
  qazsl: 'https://doi.org/10.5281/zenodo.22830162',
  guidelines:
    'https://special-edu.kz/beta/upload/files/2022/MP%20Video%20dictionary%20JY.pdf',
};
export const categorySchema = z.object({
  id: z.string().min(1),
  ru: z.string().min(1),
  kk: z.string().min(1),
  icon: z.string(),
  tint: z.string(),
});
export type Category = z.infer<typeof categorySchema>;
export const categories = categorySchema.array().parse([
  {
    id: 'greetings',
    ru: 'Приветствия',
    kk: 'Сәлемдесу',
    icon: '💬',
    tint: '#d4eede',
  },
  { id: 'family', ru: 'Семья', kk: 'Отбасы', icon: '🏡', tint: '#ffe1cd' },
  { id: 'school', ru: 'Школа', kk: 'Мектеп', icon: '📚', tint: '#dceafa' },
  {
    id: 'everyday',
    ru: 'Каждый день',
    kk: 'Күнделікті сөздер',
    icon: '🧺',
    tint: '#f9e8ac',
  },
  { id: 'emotions', ru: 'Эмоции', kk: 'Сезімдер', icon: '🌻', tint: '#ebdef8' },
  { id: 'alphabet', ru: 'Алфавит', kk: 'Әліппе', icon: '🔤', tint: '#eddff9' },
  { id: 'numbers', ru: 'Цифры', kk: 'Сандар', icon: '🔢', tint: '#d7ebfb' },
  { id: 'colors', ru: 'Цвета', kk: 'Түстер', icon: '🎨', tint: '#fbeab5' },
  {
    id: 'animals',
    ru: 'Животные',
    kk: 'Жануарлар',
    icon: '🦊',
    tint: '#fbe0ce',
  },
  { id: 'food', ru: 'Еда', kk: 'Тағамдар', icon: '🍎', tint: '#d7eddf' },
  {
    id: 'discovery',
    ru: 'Первые открытия',
    kk: 'Алғашқы жаңалықтар',
    icon: '🔍',
    tint: '#d4eede',
  },
]);
const required = z.string().trim().min(1);
const localFile = (folder: string, extensions: string) =>
  z
    .string()
    .regex(
      new RegExp(`^/content/${folder}/[a-zA-Z0-9_-]+\\.(?:${extensions})$`),
    )
    .nullable();
export const signSchema = z
  .object({
    id: required,
    title_kz: required,
    title_ru: required,
    category: required,
    word_or_concept: required,
    description_kz: required,
    description_ru: required,
    image_hint: localFile('images', 'svg|png|webp|jpg'),
    sign_image: localFile('images', 'png|webp|jpg|jpeg').optional(),
    reference_kind: z.literal('research').optional(),
    surdo_video_id: z
      .string()
      .regex(/^[A-Za-z0-9_-]{11}$/)
      .optional(),
    alphabet_pdf_page: z.number().int().positive().optional(),
    video_url: localFile('videos', 'mp4|webm'),
    thumbnail: localFile('thumbnails', 'png|webp|jpg'),
    source_name: required.nullable(),
    source_url: z.url().nullable(),
    verification_status: z.enum(['demo', 'pending', 'verified']),
    reviewed_by: required.nullable(),
    notes: z.string(),
    license: required.nullable(),
    captions: localFile('videos', 'vtt'),
    caption_language: z.enum(['ru', 'kk']).optional(),
    icon: required,
  })
  .superRefine((s, ctx) => {
    if (!categories.some((c) => c.id === s.category))
      ctx.addIssue({ code: 'custom', message: 'Unknown category' });
    if (
      s.reference_kind === 'research' &&
      !(
        s.source_url?.startsWith('https://') &&
        s.source_name &&
        s.license &&
        s.sign_image
      )
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'A research reference needs attributed, licensed local imagery',
      });
    if (
      s.verification_status === 'verified' &&
      !(
        s.source_url?.startsWith('https://') &&
        s.source_name &&
        s.reviewed_by &&
        s.license &&
        (s.sign_image || (s.video_url && s.captions)) &&
        (!s.video_url || s.captions)
      )
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Verified entries require licensed, reviewed, attributed sign imagery or captioned local video',
      });
  });
export type SignEntry = z.infer<typeof signSchema>;
// Written concepts and picture clues only. These are not sign translations.
const concepts = [
  [
    'hello',
    'greetings',
    'Привет',
    'Сәлем',
    '💬',
    'Так здороваются при встрече.',
    'Кездескенде осылай амандасады.',
  ],
  [
    'family',
    'family',
    'Семья',
    'Отбасы',
    '🏡',
    'Люди, которые заботятся друг о друге.',
    'Бір-біріне қамқор болатын адамдар.',
  ],
  [
    'book',
    'school',
    'Книга',
    'Кітап',
    '📘',
    'Её открывают, чтобы читать.',
    'Оны оқу үшін ашады.',
  ],
  [
    'water',
    'everyday',
    'Вода',
    'Су',
    '💧',
    'Её пьют, когда хочется пить.',
    'Шөлдегенде оны ішеді.',
  ],
  [
    'joy',
    'emotions',
    'Радость',
    'Қуаныш',
    '😊',
    'Так бывает, когда встречаешь друга.',
    'Досыңды көргенде осылай сезінуің мүмкін.',
  ],
  [
    'sun',
    'discovery',
    'Солнце',
    'Күн',
    '☀️',
    'Оно освещает землю днём.',
    'Ол күндіз жерге жарық береді.',
  ],
  [
    'circle',
    'discovery',
    'Круг',
    'Дөңгелек',
    '🔵',
    'Фигура без углов.',
    'Бұрышы жоқ пішін.',
  ],
  [
    'tree',
    'discovery',
    'Дерево',
    'Ағаш',
    '🌳',
    'У него есть ствол и ветки.',
    'Оның діңі мен бұтақтары бар.',
  ],
  [
    'three',
    'numbers',
    'Три',
    'Үш',
    '3',
    'Посчитай до трёх.',
    'Үшке дейін сана.',
  ],
  [
    'yellow',
    'colors',
    'Жёлтый',
    'Сары',
    '🟡',
    'Такого цвета спелый лимон.',
    'Піскен лимонның түсі осындай.',
  ],
  [
    'fox',
    'animals',
    'Лиса',
    'Түлкі',
    '🦊',
    'У неё пушистый хвост.',
    'Оның құйрығы үлпілдек.',
  ],
  [
    'apple',
    'food',
    'Яблоко',
    'Алма',
    '🍎',
    'Фрукт, который растёт на дереве.',
    'Ағашта өсетін жеміс.',
  ],
] as const;
// Replace individual records with reviewed entries, or append imports here.
const demoEntries = concepts.map(
  ([
    id,
    category,
    title_ru,
    title_kz,
    icon,
    description_ru,
    description_kz,
  ]) => ({
    id,
    category,
    title_ru,
    title_kz,
    icon,
    description_ru,
    description_kz,
    word_or_concept: id,
    image_hint: id === 'book' ? '/content/images/book.svg' : null,
    thumbnail: null,
    video_url: null,
    captions: null,
    source_name: null,
    source_url: null,
    verification_status: id === 'book' ? 'pending' : 'demo',
    reviewed_by: null,
    notes: '',
    license: null,
  }),
);
const reviewed = signSchema.array().parse(imported);
if (new Set(reviewed.map((s) => s.id)).size !== reviewed.length)
  throw new Error('Duplicate imported sign ID');
const catalog = new Map(
  [...demoEntries, ...dactylReferences].map((entry) => [
    entry.id,
    signSchema.parse(entry),
  ]),
);
for (const entry of reviewed) catalog.set(entry.id, entry);
export const signs = [...catalog.values()];
export function signById(id: string) {
  const entry = signs.find((s) => s.id === id);
  if (!entry) throw new Error(`Missing sign: ${id}`);
  return entry;
}
export function categoryFor(entry: SignEntry) {
  return categories.find((c) => c.id === entry.category)!;
}
export function mediaUrl(path: string) {
  return (process.env.NEXT_PUBLIC_CONTENT_BASE || '') + path;
}

import { z } from 'zod';
import { categories, signById, signSchema } from '../data/atlas';

export type Locale = 'ru' | 'kk';
export type Text = Record<Locale, string>;
export const t = (ru: string, kk: string): Text => ({ ru, kk });

const textSchema = z.object({ ru: z.string().min(1), kk: z.string().min(1) });
export const quizItemSchema = z
  .object({
    prompt: textSchema,
    options: z
      .array(z.object({ id: z.string(), label: textSchema, icon: z.string() }))
      .min(2),
    answer: z.string(),
  })
  .refine(
    (q) =>
      new Set(q.options.map((o) => o.id)).size === q.options.length &&
      q.options.some((o) => o.id === q.answer),
    'Invalid answer key',
  );
export type QuizItem = z.infer<typeof quizItemSchema>;
const exerciseSchema = z.object({
  id: z.string(),
  unit: z.number().int().positive(),
  title: z.object({ ru: z.string(), kk: z.string() }),
  description: z.object({ ru: z.string(), kk: z.string() }),
  icon: z.string(),
  questions: quizItemSchema.array().min(1),
  match: z.object({
    prompt: z.object({ ru: z.string(), kk: z.string() }),
    pairs: z.array(
      z.object({
        id: z.string(),
        icon: z.string(),
        label: z.object({ ru: z.string(), kk: z.string() }),
      }),
    ),
  }),
});
export const lessonSchema = signSchema.safeExtend({
  ...exerciseSchema.shape,
  material: signSchema,
});
export type Lesson = z.infer<typeof lessonSchema>;

const warmups = exerciseSchema.array().parse([
  {
    id: 'colors',
    unit: 1,
    title: t('Мир цветов', 'Түстер әлемі'),
    description: t('Различаем цвета в игре', 'Ойында түстерді ажыратамыз'),
    icon: '🎨',
    questions: [
      {
        prompt: t(
          'Какого цвета солнце на картинке?',
          'Суреттегі күннің түсі қандай?',
        ),
        options: [
          { id: 'yellow', label: t('Жёлтый', 'Сары'), icon: '☀️' },
          { id: 'blue', label: t('Синий', 'Көк'), icon: '💧' },
          { id: 'pink', label: t('Розовый', 'Қызғылт'), icon: '🌸' },
        ],
        answer: 'yellow',
      },
      {
        prompt: t('Какого цвета лист?', 'Жапырақтың түсі қандай?'),
        options: [
          { id: 'blue', label: t('Синий', 'Көк'), icon: '💧' },
          { id: 'green', label: t('Зелёный', 'Жасыл'), icon: '🍃' },
          { id: 'yellow', label: t('Жёлтый', 'Сары'), icon: '☀️' },
        ],
        answer: 'green',
      },
    ],
    match: {
      prompt: t(
        'Соедини предмет и его название',
        'Зат пен оның атауын сәйкестендір',
      ),
      pairs: [
        { id: 'sun', icon: '☀️', label: t('Солнце', 'Күн') },
        { id: 'leaf', icon: '🍃', label: t('Лист', 'Жапырақ') },
        { id: 'star', icon: '⭐', label: t('Звезда', 'Жұлдыз') },
      ],
    },
  },
  {
    id: 'shapes',
    unit: 1,
    title: t('Форма вокруг нас', 'Айналамыздағы пішіндер'),
    description: t('Ищем простые фигуры', 'Қарапайым пішіндерді табамыз'),
    icon: '🔷',
    questions: [
      {
        prompt: t('Какую фигуру напоминает мяч?', 'Доп қай пішінге ұқсайды?'),
        options: [
          { id: 'circle', label: t('Круг', 'Шеңбер'), icon: '🔵' },
          { id: 'square', label: t('Квадрат', 'Шаршы'), icon: '🟦' },
          { id: 'triangle', label: t('Треугольник', 'Үшбұрыш'), icon: '🔺' },
        ],
        answer: 'circle',
      },
      {
        prompt: t('У какой фигуры три угла?', 'Қай пішіннің үш бұрышы бар?'),
        options: [
          { id: 'square', label: t('Квадрат', 'Шаршы'), icon: '🟦' },
          { id: 'triangle', label: t('Треугольник', 'Үшбұрыш'), icon: '🔺' },
          { id: 'circle', label: t('Круг', 'Шеңбер'), icon: '🔵' },
        ],
        answer: 'triangle',
      },
    ],
    match: {
      prompt: t('Подбери названия фигур', 'Пішіндердің атауын тап'),
      pairs: [
        { id: 'circle', icon: '🔵', label: t('Круг', 'Шеңбер') },
        { id: 'square', icon: '🟦', label: t('Квадрат', 'Шаршы') },
        { id: 'triangle', icon: '🔺', label: t('Треугольник', 'Үшбұрыш') },
      ],
    },
  },
  {
    id: 'nature',
    unit: 2,
    title: t('Маленькое путешествие', 'Кішкентай саяхат'),
    description: t('Замечаем природу вокруг', 'Табиғатты байқаймыз'),
    icon: '🌿',
    questions: [
      {
        prompt: t('Что растёт в саду?', 'Бақшада не өседі?'),
        options: [
          { id: 'tree', label: t('Дерево', 'Ағаш'), icon: '🌳' },
          { id: 'star', label: t('Звезда', 'Жұлдыз'), icon: '⭐' },
          { id: 'cloud', label: t('Облако', 'Бұлт'), icon: '☁️' },
        ],
        answer: 'tree',
      },
      {
        prompt: t(
          'Что бывает в небе после дождя?',
          'Жаңбырдан кейін аспанда не пайда болады?',
        ),
        options: [
          { id: 'leaf', label: t('Лист', 'Жапырақ'), icon: '🍃' },
          { id: 'rainbow', label: t('Радуга', 'Кемпірқосақ'), icon: '🌈' },
          { id: 'fish', label: t('Рыба', 'Балық'), icon: '🐟' },
        ],
        answer: 'rainbow',
      },
    ],
    match: {
      prompt: t('Найди пары', 'Жұптарды тап'),
      pairs: [
        { id: 'tree', icon: '🌳', label: t('Дерево', 'Ағаш') },
        { id: 'cloud', icon: '☁️', label: t('Облако', 'Бұлт') },
        { id: 'rainbow', icon: '🌈', label: t('Радуга', 'Кемпірқосақ') },
      ],
    },
  },
]);

const warmupConcepts: Record<string, string> = {
  colors: 'sun',
  shapes: 'circle',
  nature: 'tree',
};
const themes = ['hello', 'family', 'book', 'water', 'joy'].map(signById);
const thematic = themes.map((entry, i) => {
  const category = categories.find((c) => c.id === entry.category)!;
  const trio = [
    entry,
    themes[(i + 1) % themes.length],
    themes[(i + 2) % themes.length],
  ];
  const pairs = trio.map((s) => ({
    id: s.id,
    label: t(s.title_ru, s.title_kz),
    icon: s.icon,
  }));
  return {
    id: `atlas-${entry.id}`,
    unit: 3,
    title: t(category.ru, category.kk),
    description: t(entry.description_ru, entry.description_kz),
    icon: category.icon,
    questions: [
      {
        prompt: t(
          `Какая картинка означает «${entry.title_ru}»?`,
          `«${entry.title_kz}» сөзіне қай сурет сәйкес келеді?`,
        ),
        options: [pairs[1], pairs[0], pairs[2]],
        answer: entry.id,
      },
      {
        prompt: t(trio[1].description_ru, trio[1].description_kz),
        options: pairs,
        answer: trio[1].id,
      },
    ],
    match: {
      prompt: t('Подбери слова к картинкам', 'Суреттерге сәйкес сөздерді тап'),
      pairs,
    },
  };
});
export const lessons = [...warmups, ...thematic].map((exercise) => {
  const material = signById(
    warmupConcepts[exercise.id] ?? exercise.id.replace(/^atlas-/, ''),
  );
  return lessonSchema.parse({
    ...material,
    ...exercise,
    title_ru: exercise.title.ru,
    title_kz: exercise.title.kk,
    description_ru: exercise.description.ru,
    description_kz: exercise.description.kk,
    material,
  });
});

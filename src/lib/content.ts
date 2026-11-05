import { z } from 'zod';

export type Locale = 'ru' | 'kk';
export type Text = Record<Locale, string>;
export const t = (ru: string, kk: string): Text => ({ ru, kk });

export const lessonSchema = z.object({
  id: z.string(), unit: z.number().int().positive(), title: z.object({ ru: z.string(), kk: z.string() }),
  description: z.object({ ru: z.string(), kk: z.string() }), icon: z.string(),
  video: z.object({ url: z.string().url().nullable(), captions: z.string().nullable(), description: z.object({ ru: z.string(), kk: z.string() }) }),
  source: z.string().nullable(), license: z.string().nullable(), approval: z.enum(['demo', 'pending', 'verified']),
  questions: z.array(z.object({ prompt: z.object({ ru: z.string(), kk: z.string() }), options: z.array(z.object({ id: z.string(), label: z.object({ ru: z.string(), kk: z.string() }), icon: z.string() })), answer: z.string() })).min(1),
  match: z.object({ prompt: z.object({ ru: z.string(), kk: z.string() }), pairs: z.array(z.object({ id: z.string(), icon: z.string(), label: z.object({ ru: z.string(), kk: z.string() }) })) }),
}).refine((lesson) => lesson.approval !== 'verified' || Boolean(lesson.video.url && lesson.video.captions && lesson.source && lesson.license), { message: 'Verified lessons require video, captions, source and license' });
export type Lesson = z.infer<typeof lessonSchema>;

export const lessons: Lesson[] = lessonSchema.array().parse([
  { id: 'colors', unit: 1, title: t('Мир цветов', 'Түстер әлемі'), description: t('Различаем цвета в игре', 'Ойында түстерді ажыратамыз'), icon: '🎨', video: { url: null, captions: null, description: t('Видео жеста появится после проверки специалистом.', 'Ым бейнесі маман тексергеннен кейін пайда болады.') }, source: null, license: null, approval: 'demo', questions: [
    { prompt: t('Какого цвета солнце на картинке?', 'Суреттегі күннің түсі қандай?'), options: [{ id: 'yellow', label: t('Жёлтый', 'Сары'), icon: '☀️' }, { id: 'blue', label: t('Синий', 'Көк'), icon: '💧' }, { id: 'pink', label: t('Розовый', 'Қызғылт'), icon: '🌸' }], answer: 'yellow' },
    { prompt: t('Какого цвета лист?', 'Жапырақтың түсі қандай?'), options: [{ id: 'blue', label: t('Синий', 'Көк'), icon: '💧' }, { id: 'green', label: t('Зелёный', 'Жасыл'), icon: '🍃' }, { id: 'yellow', label: t('Жёлтый', 'Сары'), icon: '☀️' }], answer: 'green' },
  ], match: { prompt: t('Соедини предмет и его название', 'Зат пен оның атауын сәйкестендір'), pairs: [{ id: 'sun', icon: '☀️', label: t('Солнце', 'Күн') }, { id: 'leaf', icon: '🍃', label: t('Лист', 'Жапырақ') }, { id: 'star', icon: '⭐', label: t('Звезда', 'Жұлдыз') }] } },
  { id: 'shapes', unit: 1, title: t('Форма вокруг нас', 'Айналамыздағы пішіндер'), description: t('Ищем простые фигуры', 'Қарапайым пішіндерді табамыз'), icon: '🔷', video: { url: null, captions: null, description: t('Проверенное видео пока недоступно.', 'Тексерілген бейне әзірге жоқ.') }, source: null, license: null, approval: 'demo', questions: [
    { prompt: t('Какую фигуру напоминает мяч?', 'Доп қай пішінге ұқсайды?'), options: [{ id: 'circle', label: t('Круг', 'Шеңбер'), icon: '🔵' }, { id: 'square', label: t('Квадрат', 'Шаршы'), icon: '🟦' }, { id: 'triangle', label: t('Треугольник', 'Үшбұрыш'), icon: '🔺' }], answer: 'circle' },
    { prompt: t('У какой фигуры три угла?', 'Қай пішіннің үш бұрышы бар?'), options: [{ id: 'square', label: t('Квадрат', 'Шаршы'), icon: '🟦' }, { id: 'triangle', label: t('Треугольник', 'Үшбұрыш'), icon: '🔺' }, { id: 'circle', label: t('Круг', 'Шеңбер'), icon: '🔵' }], answer: 'triangle' },
  ], match: { prompt: t('Подбери названия фигур', 'Пішіндердің атауын тап'), pairs: [{ id: 'circle', icon: '🔵', label: t('Круг', 'Шеңбер') }, { id: 'square', icon: '🟦', label: t('Квадрат', 'Шаршы') }, { id: 'triangle', icon: '🔺', label: t('Треугольник', 'Үшбұрыш') }] } },
  { id: 'nature', unit: 2, title: t('Маленькое путешествие', 'Кішкентай саяхат'), description: t('Замечаем природу вокруг', 'Табиғатты байқаймыз'), icon: '🌿', video: { url: null, captions: null, description: t('Видео в ожидании экспертной проверки.', 'Бейне маман тексеруін күтуде.') }, source: null, license: null, approval: 'demo', questions: [
    { prompt: t('Что растёт в саду?', 'Бақшада не өседі?'), options: [{ id: 'tree', label: t('Дерево', 'Ағаш'), icon: '🌳' }, { id: 'star', label: t('Звезда', 'Жұлдыз'), icon: '⭐' }, { id: 'cloud', label: t('Облако', 'Бұлт'), icon: '☁️' }], answer: 'tree' },
    { prompt: t('Что бывает в небе после дождя?', 'Жаңбырдан кейін аспанда не пайда болады?'), options: [{ id: 'leaf', label: t('Лист', 'Жапырақ'), icon: '🍃' }, { id: 'rainbow', label: t('Радуга', 'Кемпірқосақ'), icon: '🌈' }, { id: 'fish', label: t('Рыба', 'Балық'), icon: '🐟' }], answer: 'rainbow' },
  ], match: { prompt: t('Найди пары', 'Жұптарды тап'), pairs: [{ id: 'tree', icon: '🌳', label: t('Дерево', 'Ағаш') }, { id: 'cloud', icon: '☁️', label: t('Облако', 'Бұлт') }, { id: 'rainbow', icon: '🌈', label: t('Радуга', 'Кемпірқосақ') }] } },
]);

export const dictionary = lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, category: lesson.unit === 1 ? t('Первые открытия', 'Алғашқы жаңалықтар') : t('Природа', 'Табиғат'), video: lesson.video, approval: lesson.approval, source: lesson.source, license: lesson.license }));

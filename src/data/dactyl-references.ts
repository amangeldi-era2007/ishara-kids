export const surdoSources = {
  website: 'http://surdo.kz/rus/index',
  channel: 'https://www.youtube.com/@surdoKazakhstan',
  alphabet:
    'https://www.youtube.com/playlist?list=PLMNYxpfNIsWzMjY7uMjZhbrhX5ll6_ss0',
};

// Kazakh Cyrillic order. Video IDs are the titled clips in the channel's Әліппе playlist.
const letters = [
  ['А', 'a', 'LBFsmk7kooQ'],
  ['Ә', 'ae', 'vXc_OMRw-ek'],
  ['Б', 'b', 'jhmtdinluLk'],
  ['В', 'v', '11T1owDlWC0'],
  ['Г', 'g', '0mJupwZb8vk'],
  ['Ғ', 'gh', 'mm4kD30r89I'],
  ['Д', 'd', 'qa0EMegWkIA'],
  ['Е', 'e', 'qMoUuPFr5jM'],
  ['Ё', 'yo', 'Fj_OY85_qrM'],
  ['Ж', 'zh', 'rXDZ8zqm3xA'],
  ['З', 'z', 'bNMINs-A4mk'],
  ['И', 'i', 'QF6zMkgKMnM'],
  ['Й', 'j', 'iAnraRHKWY0'],
  ['К', 'k', 'JqAFpKZI0wk'],
  ['Қ', 'q', 'dnWpJDEdsqw'],
  ['Л', 'l', 'QngmH9wHZ_0'],
  ['М', 'm', 'wCq4QB_3hSU'],
  ['Н', 'n', 'JV09jOl-uD4'],
  ['Ң', 'ng', 'r_gKsFMNxyc'],
  ['О', 'o', 'YShMbUzOqck'],
  ['Ө', 'oe', 'BIlIbNiHJSo'],
  ['П', 'p', 'kJAUxA91eyg'],
  ['Р', 'r', '63Xslfr4VD8'],
  ['С', 's', '1qnhE4-pguo'],
  ['Т', 't', 'GTQDY9f7UrM'],
  ['У', 'u', 'q_isprC03eg'],
  ['Ұ', 'uq', 'XDbmRsxCuIY'],
  ['Ү', 'ue', null],
  ['Ф', 'f', 'rZ5di9-JZng'],
  ['Х', 'kh', '6UuINqsH3x0'],
  ['Һ', 'h', 'zySXMQue2gA'],
  ['Ц', 'ts', 'nZ9Co_XsKSM'],
  ['Ч', 'ch', 'nBRRAjiNovo'],
  ['Ш', 'sh', 'ONLARL5Jjnk'],
  ['Щ', 'shch', 'mMXq280DxoU'],
  ['Ъ', 'hard-sign', 'UTSetRhp_DM'],
  ['Ы', 'y', 'L3LthsEXGxQ'],
  ['І', 'ii', 'W2PfoWp5pkU'],
  ['Ь', 'soft-sign', 'ExmRc38dZNc'],
  ['Э', 'eh', 'LY8MpyT3YD4'],
  ['Ю', 'yu', 'STAM0ogTyRo'],
  ['Я', 'ya', 'jEPbSLxActg'],
] as const;

const existingPng = new Set(['b', 'f', 'l', 'm', 'p']);

export const dactylReferences = letters.map(([letter, key, video]) => {
  // Neither Ъ nor Ь is pictured in Figure 1. The original videos show the motion.
  const hasPhoto = key !== 'hard-sign' && key !== 'soft-sign';
  const extension = existingPng.has(key) ? 'png' : 'webp';
  return {
    id: `qazsl-${key}`,
    title_kz: letter,
    title_ru: letter,
    category: 'alphabet',
    word_or_concept: letter,
    description_kz: hasPhoto
      ? 'Қолдың қалпын суреттен қара.'
      : 'Қол қимылын бейнеден қара.',
    description_ru: hasPhoto
      ? 'Рассмотри положение кисти и пальцев на фото.'
      : 'Посмотри движение кисти на видео.',
    image_hint: null,
    video_url: null,
    thumbnail: null,
    captions: null,
    icon: letter,
    sign_image: hasPhoto ? `/content/images/qazsl-${key}.${extension}` : null,
    source_name: hasPhoto
      ? 'Kerimbayev, Beisov & Jotsov · Technologies (2026), fig. 1'
      : null,
    source_url: hasPhoto
      ? 'https://doi.org/10.3390/technologies14110744'
      : null,
    verification_status: 'pending',
    reviewed_by: null,
    license: hasPhoto ? 'CC BY 4.0' : null,
    reference_kind: hasPhoto ? 'research' : undefined,
    surdo_video_id: video ?? undefined,
    alphabet_pdf_page: video === null ? 5 : undefined,
    notes: hasPhoto
      ? 'Figure 1 photo, cropped and upscaled without changing the pose. Not an AI template.'
      : 'Original Surdo video link only.',
  };
});

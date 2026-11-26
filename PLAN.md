# Ishara Kids MVP

## Обновление: детский атлас
1. Проверить источники «e-Ымдау» и методических рекомендаций на сайте Центра; проверить наличие локальных медиа.
2. Использовать кремовую обложку, иллюстрацию степи, Мими и цветные марки категорий как общий язык главной, маршрута и словаря.
3. Вынести карточки понятий и правила экспертной проверки в один каталог. Связать уроки, игры и словарь по ID, сохранить прежние адреса уроков и ключ прогресса.
4. Дать редактору JSON-импорт, папки медиа и инструкцию; скрывать непроверенные демонстрации.
5. Проверить фильтры, переключение языков, ответы, защиту от повторных наград, мобильное меню и статический экспорт для Pages.

- Routes: `/`, `/learn`, `/learn/[id]`, `/games`, `/rewards`, `/profile`, `/dictionary`, `/parents`.
- Architecture: App Router pages, shared client provider/header, reusable lesson/game/reward components; local typed demo dataset and Zod schemas separated from presentation.
- State: versioned, validated localStorage adapter (nickname, avatar, locale, lesson results, game rewards). No accounts or remote requests. Future backend can implement the same repository interface.
- Design: cream canvas, ink navy, mint, sky, coral, sunshine and lavender design tokens; rounded tactile cards, original SVG mascot, responsive grid, reduced-motion animation.
- Acceptance: all routes render; locale switching; exercises and feedback; completion persists once with deterministic stars; unlock next lesson; games work; search/filter and reset work; no unverified sign shown as instruction; tests, typecheck, lint and build pass; desktop/mobile browser flow checked.

# Ishara Kids MVP

- Routes: `/`, `/learn`, `/learn/[id]`, `/games`, `/rewards`, `/profile`, `/dictionary`, `/parents`.
- Architecture: App Router pages, shared client provider/header, reusable lesson/game/reward components; local typed demo dataset and Zod schemas separated from presentation.
- State: versioned, validated localStorage adapter (nickname, avatar, locale, lesson results, game rewards). No accounts or remote requests. Future backend can implement the same repository interface.
- Design: cream canvas, ink navy, mint, sky, coral, sunshine and lavender design tokens; rounded tactile cards, original SVG mascot, responsive grid, reduced-motion animation.
- Acceptance: all routes render; locale switching; exercises and feedback; completion persists once with deterministic stars; unlock next lesson; games work; search/filter and reset work; no unverified sign shown as instruction; tests, typecheck, lint and build pass; desktop/mobile browser flow checked.

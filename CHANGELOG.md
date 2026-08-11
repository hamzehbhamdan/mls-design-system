# Changelog

## 1.0.0 — 2026-08-10

First release. Compiled from public sources in August 2026.

### Foundations
- Token source of truth in W3C DTCG format; 242 resolved tokens
- Six perceptually-even OKLCH ramps, neutrals carrying a navy cast borrowed from the league navy
- Three-tier colour architecture: primitive → brand → semantic, with `accent` as a themeable slot
- Full light and dark schemes, both first-class
- Type scale named by job rather than size, fluid display sizes
- 4px space grid, tight radii, fast motion with a signature `drive` easing

### Club theming
- All 30 clubs themeable via `data-club`
- Two values per club: the true brand colour (`--mls-club-primary`, never altered) and a contrast-corrected UI accent
- 24 of 30 accents auto-corrected in OKLab to clear 3.2:1 on their background and 4.5:1 for their label
- Achromatic primaries (LAFC, D.C. United) promoted to a chromatic club colour rather than lightened into grey
- Explicit confidence rating and disagreement notes per club; two colours left `null` rather than guessed

### Components
Button, card, crest slot, scoreline, standings table, stat and statbar, badge and form line, header/nav/tabs, form controls, alert, empty state, skeleton. Plain CSS on semantic HTML, state in ARIA and `data-` attributes.

### Graphic devices
The Slash and The Corners, both named in MLS's own partner guidelines, plus duotone photography and the diagonal hatch. All inherit the club accent.

### Documentation
Sixteen chapters covering the visual system, the verbal system (voice, vocabulary, editorial style, inclusive language), accessibility, the 2027 calendar transition, and a full sourcing-and-confidence audit.

### Tooling
- `npm run build` — emits CSS, SCSS, JS, TypeScript declarations, JSON, a Tailwind preset, club themes, and the generated club reference table
- `npm run verify` — 175 checks: token resolution, undefined CSS variables, WCAG contrast in both schemes, all 30 club accents, club data integrity, `@dsCard` markers, doc presence
- GitHub Actions workflow gating on both, including a check that `dist/` has not drifted from its sources

### Known gaps
League colour values, the live mlssoccer.com font stack, and any post-2015 MLS brand guidelines could not be verified. See `docs/15-sourcing-and-confidence.md`.

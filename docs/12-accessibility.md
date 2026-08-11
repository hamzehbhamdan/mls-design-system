# Accessibility

**Target: WCAG 2.2 Level AA.** Not aspirational — `npm run verify` fails the build if a semantic colour pair or a club accent drops below threshold.

A league that publishes a Soccer For All commitment and ships a 2:1 contrast interface has a consistency problem. This chapter is the brand promise expressed as engineering constraints.

## Contrast

| Content | Minimum |
|---|---|
| Body text | 4.5:1 |
| Text 18.66px bold or 24px+ | 3:1 |
| UI components, borders, focus | 3:1 |
| Club accents (both schemes) | 3.2:1 — enforced at build |

Verified pairs, both schemes:

```
light fg on bg        #29313E on #FFFFFF   13.10:1
light muted on bg     #5B616C on #FFFFFF    6.23:1
brand red on white    #E2231A on #FFFFFF    4.68:1
white on navy         #FFFFFF on #001F5B   15.59:1
dark fg on bg         #F2F4F8 on #18212F   14.70:1
dark muted on bg      #BDC2CA on #18212F    9.04:1
```

All 30 club accents clear 3.2:1 in both schemes. **24 required correction to get there** — see [03 Colour](03-color.md).

## Colour is never the only channel

Roughly one in twelve men has a colour-vision deficiency. A league product is also viewed in direct sunlight, on a stadium LED wall, and in greyscale print. Every colour signal here is doubled:

| Signal | Colour | Second channel |
|---|---|---|
| Win / draw / loss | green / grey / red | the letters **W D L** |
| Qualification zone | coloured rule | a written legend |
| Stat movement | green / red | ↑ ↓ → arrow |
| Match result | dimmed loser | font weight on the winner |
| Form error | red border | icon + message, driven by `aria-invalid` |
| Live match | red | the word **LIVE** |

Test by screenshotting in greyscale. If you cannot read the state, it fails.

## Keyboard

- Everything interactive is reachable and operable by keyboard.
- **Focus is always visible.** `:focus-visible` with a 2px outline and 2px offset, sitting on the `focus` token, which is a navy distinct from the accent so it stays visible on every club theme.
- Never `outline: none` without an equivalent replacement.
- `.mls-skip-link` is the first focusable element on every page.
- Logical tab order. Do not use positive `tabindex`.

## Screen readers

**State lives in ARIA, not in class names.** This is the core structural decision: `aria-invalid`, `aria-selected`, `aria-pressed`, `aria-current` and `data-state` drive the styling. Visual state and announced state cannot drift apart, because they are the same attribute.

Component-specific:

- **Scoreline** — the clock is `aria-live="polite"` so a score change is announced without re-navigation. Never `assertive`; a 90-minute match would be unbearable.
- **Standings** — `<caption>` (visually hidden is fine), `scope="col"` on headers, `scope="row"` on the club cell so each figure is announced with its club.
- **Crest** — `alt=""` when a club name is already adjacent in the DOM. `alt="Portland Timbers"` when the crest is the only identification. **Never** `alt="Portland Timbers logo"` — a screen reader renders that as "Portland Timbers logo, image."
- **Buttons** — an icon-only button needs `aria-label`. `data-loading="true"` should be paired with `aria-busy="true"`.
- **Skeletons** — wrap in `aria-busy="true"` so the region is not announced as empty content.
- **Tabs** — `role="tablist"` / `role="tab"` / `aria-selected`.

## Motion

`prefers-reduced-motion: reduce` stops everything, set globally in the reset and re-declared per animated component.

This is safe because **every animation in this system is decorative** — the live pulse, the skeleton shimmer, the button spinner, the switch thumb, the card lift. None carries meaning that is lost when it stops. The live badge still reads LIVE; the skeleton is still a grey block.

If you add an animation that *does* carry meaning, that is a design bug, not grounds for an exemption.

No parallax. No auto-playing video with motion in the first viewport. Nothing flashes more than three times per second.

## Typography

- Minimum body size 16px. Below 13px use `--mls-font-micro`.
- **All-caps below 13px always gets `--mls-letterSpacing-widest`.** Untracked small caps are genuinely hard to read.
- Line height 1.5 for UI, 1.65 for long-form.
- `.mls-prose` caps measure at 68ch.
- Layout survives 200% zoom and 400% reflow at 320px width.
- Uppercase for display, labels and buttons only. Never a paragraph — it destroys word-shape recognition.

## Forms

- Every input has a real `<label>`. A placeholder is not a label.
- Errors are text plus icon plus `aria-invalid`, adjacent to the field, not only at the top.
- `.mls-label[data-required]` adds a visual asterisk; also set `required` and `aria-required`.
- Native controls with `accent-color` for checkbox, radio and range — the club theme flows through with no loss of native behaviour, which is almost always better than a custom control.
- Touch targets 44×44px minimum. `.mls-btn--sm` at default padding is under this — pad the hit area when using it on touch.

## Language and structure

- Set `lang` on `<html>`, and on any element that switches language. This matters more than usual here: MLS content mixes English, Spanish and Québec French, and unmarked *golazo* or *partisans* is mispronounced by a screen reader.
- One `<h1>` per page. Do not skip heading levels.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`.

## Verifying

```bash
npm run verify
```

Checks every semantic pair, all 30 club accents in both schemes, every token alias, and every preview file for a `@dsCard` marker.

What it cannot check, and what still needs a human: keyboard order, screen-reader announcement quality, whether alt text is actually useful, and whether a state is comprehensible in greyscale. Do those manually.
